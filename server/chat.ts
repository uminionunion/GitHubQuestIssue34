
import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface UserPayload {
  userId: number;
  username: string;
}

export function setupChat(io: SocketIOServer) {
  const usersInRooms: Record<string, Record<string, { username: string }>> = {};

  io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (cookie) {
      const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (token) {
        try {
          const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
          (socket as any).user = payload;
          return next();
        } catch (err) {
          // Invalid token
        }
      }
    }
    // Allow unauthenticated users to connect but they won't be able to send messages
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);
    const user = (socket as any).user as UserPayload | undefined;

    socket.on('joinRoom', async (room) => {
      socket.join(room);
      console.log(`User ${user?.username || socket.id} joined room: ${room}`);

      if (user) {
        if (!usersInRooms[room]) {
          usersInRooms[room] = {};
        }
        usersInRooms[room][socket.id] = { username: user.username };
        io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
      }

      try {
        const messages = await db
          .selectFrom('messages')
          .innerJoin('users', 'users.id', 'messages.user_id')
          .where('room', '=', room)
          .orderBy('timestamp', 'asc')
          .limit(50)
          .select(['messages.id', 'messages.content', 'messages.is_anonymous', 'messages.timestamp', 'users.username'])
          .execute();
        
        const formattedMessages = messages.map(msg => ({
          ...msg,
          username: msg.is_anonymous ? 'Anonymous' : msg.username,
        }));

        socket.emit('loadMessages', formattedMessages);
      } catch (error) {
        console.error(`Error loading messages for room ${room}:`, error);
      }
    });

    socket.on('sendMessage', async (data: { room: string; content: string; isAnonymous: boolean }) => {
      if (!user) {
        socket.emit('error', 'You must be logged in to send messages.');
        return;
      }

      const { room, content, isAnonymous } = data;
      
      try {
        const newMessage = await db
          .insertInto('messages')
          .values({
            content,
            room,
            user_id: user.userId,
            is_anonymous: isAnonymous,
          })
          .returningAll()
          .executeTakeFirst();

        if (newMessage) {
          const messageForClient = {
            id: newMessage.id,
            content: newMessage.content,
            username: isAnonymous ? 'Anonymous' : user.username,
            is_anonymous: newMessage.is_anonymous,
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
      console.log(`User ${user?.username || socket.id} left room: ${room}`);
      if (user && usersInRooms[room]) {
        delete usersInRooms[room][socket.id];
        io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (user) {
        for (const room in usersInRooms) {
          if (usersInRooms[room][socket.id]) {
            delete usersInRooms[room][socket.id];
            io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
          }
        }
      }
    });
  });
}
