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



// Format timestamp to readable date and time (e.g., "Feb 10, 2025 3:45 PM")
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
}



let anonymousCounter = 0;
const usersInRooms: { [room: string]: { [socketId: string]: { username: string } } } = {};

export function setupChat(io: SocketIOServer) {
  io.use((socket: any, next: any) => {
    let token: string | undefined;

    // Try to get token from cookies (most reliable method)
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const tokenMatch = cookies
        .split(';')
        .find(c => c.trim().startsWith('token='));
      if (tokenMatch) {
        token = tokenMatch.split('=')[1];
        console.log(`[CHAT AUTH] Token found in cookies for socket ${socket.id}`);
      }
    }

    // If token found, verify it
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
        socket.user = payload;
        console.log(`[CHAT AUTH] ✅ Socket ${socket.id} authenticated as user ID ${payload.userId} (${payload.username})`);
      } catch (err) {
        console.log(`[CHAT AUTH] ❌ Invalid token for socket ${socket.id}, treating as anonymous`);
        // Invalid token - user can still join as anonymous
      }
    } else {
      console.log(`[CHAT AUTH] No token found for socket ${socket.id}, treating as anonymous`);
    }

    // Assign an anonymous ID if not logged in
    if (!socket.user) {
      anonymousCounter++;
      socket.anonymousId = `Anonymous${String(anonymousCounter).padStart(3, '0')}`;
      console.log(`[CHAT AUTH] Assigned anonymous ID to socket ${socket.id}: ${socket.anonymousId}`);
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
        
  const formattedMessages = messages.map(msg => {
  let displayUsername: string;
  let displayIsAnonymous: boolean;
  
  if (msg.is_anonymous === 1) {
    // Message was posted anonymously
    displayUsername = msg.anonymous_username || 'Anonymous';
    displayIsAnonymous = true;
  } else if (msg.username) {
    // Message was posted by logged-in user with their real name
    displayUsername = msg.username;
    displayIsAnonymous = false;
  } else {
    // Fallback - shouldn't happen with correct logic
    displayUsername = 'Anonymous';
    displayIsAnonymous = true;
  }
  
  return {
    id: msg.id,
    content: msg.content,
    username: displayUsername,
    is_anonymous: displayIsAnonymous,
    timestamp: msg.timestamp,
  };
});

socket.emit('loadMessages', formattedMessages);
      } catch (error) {
        console.error(`Error loading messages for room ${room}:`, error);
      }
    });

    socket.on('sendMessage', async (data: { room: string; content: string; isAnonymous: boolean }) => {
  const { room, content, isAnonymous } = data;
  
  try {
    let userId: number | null = null;
        let anonymousUsername: string | null = null;
        let isAnon: 0 | 1 = 0;
        
        // DETERMINE WHO IS SENDING THE MESSAGE
        if (socket.user) {
          // LOGGED-IN USER
          userId = socket.user.userId;
          if (isAnonymous) {
            // They clicked "Post Anonymously?" - mark as anonymous
            isAnon = 1 as const;
            anonymousUsername = socket.anonymousId || `Anonymous${anonymousCounter}`;
          } else {
            // They did NOT click "Post Anonymously?" - post as themselves
            isAnon = 0 as const;
            anonymousUsername = null;  // No anonymous name needed
          }
        } else {
          // NOT LOGGED-IN USER - Always anonymous
          userId = null;
          isAnon = 1 as const;
          anonymousUsername = socket.anonymousId || `Anonymous${anonymousCounter}`;
        }

        // Save message to database
        const newMessage = await db
          .insertInto('messages')
          .values({
            content,
            room,
            user_id: userId,
            is_anonymous: isAnon,
            anonymous_username: anonymousUsername,
          })
          .returningAll()
          .executeTakeFirst();

    if (newMessage) {
      // Determine display username for clients
      let displayUsername: string;
      if (isAnon === 1 && anonymousUsername) {
        displayUsername = anonymousUsername;  // Show "AnonymousXXX"
      } else if (socket.user) {
        displayUsername = socket.user.username;  // Show their actual username
      } else {
        displayUsername = 'Anonymous';
      }

      const messageForClient = {
        id: newMessage.id,
        content: newMessage.content,
        username: displayUsername,
        is_anonymous: isAnon === 1,
        timestamp: newMessage.timestamp,
      };

      console.log(`[CHAT] Message from: "${displayUsername}" | Anonymous: ${isAnon === 1 ? 'YES' : 'NO'} | UserID: ${userId}`);
      io.to(room).emit('receiveMessage', messageForClient);
    }
  } catch (error) {
    console.error('Error saving message:', error);
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
