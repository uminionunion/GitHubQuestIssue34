
import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface UserPayload {
  userId: number;
  username: string;
}

interface SocketWithUser extends Socket {
    user?: UserPayload;
    anonymousId?: string;
}

// Helper function to get timezone offset in hours
function getTimezoneOffset(timezone: string): number {
  const offsets: Record<string, number> = {
    'PST': -8,
    'MST': -7,
    'CST': -6,
    'EST': -5,
  };
  return offsets[timezone] || -5; // Default to EST
}

// Check if messages need to be reset based on timezone
async function checkAndResetChatMessages(room: string) {
  try {
    // Get the reset schedule for this room
    const schedule = await db
      .selectFrom('chat_reset_schedule')
      .selectAll()
      .where('room', '=', room)
      .executeTakeFirst();

    if (!schedule) return;

    // Get current time in the specified timezone
    const now = new Date();
    const offset = getTimezoneOffset(schedule.timezone);
    const timezoneDate = new Date(now.getTime() + (offset + new Date().getTimezoneOffset() / 60) * 60 * 60 * 1000);
    
    const lastReset = new Date(schedule.last_reset_at);
    const lastResetDate = new Date(lastReset.getTime() + (offset + new Date().getTimezoneOffset() / 60) * 60 * 60 * 1000);

    // Check if a full day has passed in the timezone
    if (timezoneDate.getDate() !== lastResetDate.getDate()) {
      // Archive old messages
      const oldMessages = await db
        .selectFrom('messages')
        .selectAll()
        .where('room', '=', room)
        .orderBy('timestamp', 'asc')
        .execute();

      if (oldMessages.length > 0) {
        await db
          .insertInto('chat_message_archives')
          .values({
            room,
            archived_messages: JSON.stringify(oldMessages),
          })
          .execute();

        // Delete old messages
        await db
          .deleteFrom('messages')
          .where('room', '=', room)
          .execute();

        // Update last reset time
        await db
          .updateTable('chat_reset_schedule')
          .set({ last_reset_at: new Date().toISOString() })
          .where('room', '=', room)
          .execute();

        console.log(`[CHAT] Room ${room} messages archived and reset`);
      }
    }
  } catch (error) {
    console.error(`[CHAT] Error checking reset for ${room}:`, error);
  }
}

export function setupChat(io: SocketIOServer) {
  const usersInRooms: Record<string, Record<string, { username: string }>> = {};
  let anonymousCounter = 0;

  io.use((socket: SocketWithUser, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (cookie) {
      const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (token) {
        try {
          const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
          socket.user = payload;
          return next();
        } catch (err) {
          // Invalid token
        }
      }
    }
    // Assign an anonymous ID if not logged in
    anonymousCounter++;
    socket.anonymousId = `Anonymous${String(anonymousCounter).padStart(3, '0')}`;
    next();
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log('A user connected:', socket.id, 'as', socket.user?.username || socket.anonymousId);
    
    socket.on('joinRoom', async (room) => {
      await checkAndResetChatMessages(room);
      socket.join(room);
      const displayName = socket.user?.username || socket.anonymousId;
      console.log(`User ${displayName} joined room: ${room}`);

      if (!usersInRooms[room]) {
        usersInRooms[room] = {};
      }
      usersInRooms[room][socket.id] = { username: displayName! };
      io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
      

      try {
        const messages = await db
          .selectFrom('messages')
          .leftJoin('users', 'users.id', 'messages.user_id')
          .where('room', '=', room)
          .orderBy('timestamp', 'asc')
          .limit(50)
          .select(['messages.id', 'messages.content', 'messages.is_anonymous', 'messages.timestamp', 'users.username', 'messages.anonymous_username'])
          .execute();
        
        const formattedMessages = messages.map(msg => ({
          ...msg,
          username: msg.is_anonymous ? (msg.anonymous_username || 'Anonymous') : msg.username,
        }));

        socket.emit('loadMessages', formattedMessages);
      } catch (error) {
        console.error(`Error loading messages for room ${room}:`, error);
      }
    });

    socket.on('sendMessage', async (data: { room: string; content: string; isAnonymous: boolean }) => {
      const { room, content, isAnonymous } = data;
      
      if (!socket.user && !isAnonymous) {
          socket.emit('error', 'You must be logged in to send non-anonymous messages.');
          return;
      }

      try {
        const newMessage = await db
          .insertInto('messages')
          .values({
            content,
            room,
            user_id: socket.user?.userId || null,
            is_anonymous: socket.user ? (isAnonymous ? 1 : 0) : 1,
            anonymous_username: socket.user ? null : socket.anonymousId,
          })
          .returningAll()
          .executeTakeFirst();

        if (newMessage) {
          const messageForClient = {
            id: newMessage.id,
            content: newMessage.content,
            username: (socket.user && !isAnonymous) ? socket.user.username : (newMessage.anonymous_username || 'Anonymous'),
            is_anonymous: socket.user ? isAnonymous : true,
            timestamp: newMessage.timestamp,
          };
          io.to(room).emit('receiveMessage', messageForClient);
        }
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      const displayName = socket.user?.username || socket.anonymousId;
      console.log(`User ${displayName} left room: ${room}`);
      if (usersInRooms[room]) {
        delete usersInRooms[room][socket.id];
        io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
      }
    });

    socket.on('disconnect', () => {
      const displayName = socket.user?.username || socket.anonymousId;
      console.log('User disconnected:', socket.id, 'as', displayName);
      for (const room in usersInRooms) {
        if (usersInRooms[room][socket.id]) {
          delete usersInRooms[room][socket.id];
          io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
        }
      }
    });

socket.on('loadArchive', async (data: { room: string; page: number }) => {
  const { room, page = 1 } = data;
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  try {
    const archives = await db
      .selectFrom('chat_message_archives')
      .selectAll()
      .where('room', '=', room)
      .orderBy('archived_at', 'desc')
      .execute();

    if (archives.length === 0) {
      socket.emit('archiveLoaded', { messages: [], hasMore: false, currentPage: page });
      return;
    }

    // Parse the most recent archive
    const latestArchive = archives[0];
    const allArchivedMessages = JSON.parse(latestArchive.archived_messages);

    // Paginate through the archived messages
    const paginatedMessages = allArchivedMessages
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + pageSize);

    socket.emit('archiveLoaded', {
      messages: paginatedMessages,
      hasMore: offset + pageSize < allArchivedMessages.length,
      currentPage: page,
    });
  } catch (error) {
    console.error(`[CHAT] Error loading archive for ${room}:`, error);
    socket.emit('error', 'Failed to load archive');
  }
});
    
  });
}
