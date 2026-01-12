import { Server as SocketIOServer } from 'socket.io';
import { db } from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface SocketWithUser {
  id: string;
  user?: { userId: number; username: string };
  anonymousId?: string;
  on: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data: any) => void;
  join: (room: string) => void;
}

let anonymousCounter = 0;
const usersInRooms: { [room: string]: { [socketId: string]: { username: string } } } = {};

export function setupChat(io: SocketIOServer) {
  io.use((socket: any, next: any) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
        socket.user = payload;
      } catch (err) {
        // Invalid token - user can still join as anonymous
      }
    }
    // Assign an anonymous ID if not logged in
    if (!socket.user) {
      anonymousCounter++;
      socket.anonymousId = `Anonymous${String(anonymousCounter).padStart(3, '0')}`;
    }
    next();
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log('A user connected:', socket.id, 'as', socket.user?.username || socket.anonymousId);
    
    socket.on('joinRoom', async (room: string) => {
      socket.join(room);
      const displayName = socket.user?.username || socket.anonymousId;
      console.log(`User ${displayName} joined room: ${room}`);

      if (!usersInRooms[room]) {
        usersInRooms[room] = {};
      }
      usersInRooms[room][socket.id] = { username: displayName! };
      io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));

      try {
        // Load last 50 messages from this room
        const messages = await db
          .selectFrom('messages')
          .leftJoin('users', 'users.id', 'messages.user_id')
          .where('room', '=', room)
          .orderBy('timestamp', 'asc')
          .limit(50)
          .select([
            'messages.id',
            'messages.content',
            'messages.is_anonymous',
            'messages.timestamp',
            'users.username',
            'messages.anonymous_username'
          ])
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
      
      try {
        let userId = null;
        let anonymousUsername = null;

        if (isAnonymous) {
          anonymousUsername = socket.anonymousId || `Anonymous${anonymousCounter}`;
        } else if (socket.user) {
          userId = socket.user.userId;
        } else {
          // Non-authenticated, must be anonymous
          anonymousUsername = socket.anonymousId || `Anonymous${anonymousCounter}`;
        }

        // Save message to database
        const message = await db
          .insertInto('messages')
          .values({
            content,
            room,
            user_id: userId,
            is_anonymous: isAnonymous ? 1 : 0,
            anonymous_username: anonymousUsername,
          })
          .returning('id')
          .executeTakeFirstOrThrow();

        console.log(`Message saved to room ${room}:`, content);

        // Broadcast to all users in room
        io.to(room).emit('newMessage', {
          id: message.id,
          content,
          username: isAnonymous ? anonymousUsername : socket.user?.username,
          timestamp: new Date().toISOString(),
          is_anonymous: isAnonymous ? 1 : 0,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      
      // Remove user from all rooms they were in
      Object.keys(usersInRooms).forEach(room => {
        if (usersInRooms[room][socket.id]) {
          delete usersInRooms[room][socket.id];
          io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
        }
      });
    });
  });
}
