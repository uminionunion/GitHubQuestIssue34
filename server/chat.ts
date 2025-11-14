
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
  });
}
