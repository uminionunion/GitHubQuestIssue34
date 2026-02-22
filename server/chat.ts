
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

// ===============================================
// TIMEZONE & ARCHIVING HELPER FUNCTIONS
// ===============================================

// Map room names to timezones
const roomTimezoneMap: Record<string, string> = {
  'SisterUnion001NewEngland-chatroom-1': 'EST',
  'SisterUnion001NewEngland-chatroom-2': 'EST',
  'SisterUnion001NewEngland-chatroom-3': 'EST',
  'SisterUnion002CentralEastCoast-chatroom-1': 'EST',
  'SisterUnion002CentralEastCoast-chatroom-2': 'EST',
  'SisterUnion002CentralEastCoast-chatroom-3': 'EST',
  'SisterUnion003SouthEast-chatroom-1': 'EST',
  'SisterUnion003SouthEast-chatroom-2': 'EST',
  'SisterUnion003SouthEast-chatroom-3': 'EST',
  'SisterUnion004TheGreatLakesAndAppalachia-chatroom-1': 'EST',
  'SisterUnion004TheGreatLakesAndAppalachia-chatroom-2': 'EST',
  'SisterUnion004TheGreatLakesAndAppalachia-chatroom-3': 'EST',
  'SisterUnion005CentralSouth-chatroom-1': 'CST',
  'SisterUnion005CentralSouth-chatroom-2': 'CST',
  'SisterUnion005CentralSouth-chatroom-3': 'CST',
  'SisterUnion006CentralNorth-chatroom-1': 'CST',
  'SisterUnion006CentralNorth-chatroom-2': 'CST',
  'SisterUnion006CentralNorth-chatroom-3': 'CST',
  'SisterUnion007SouthWest-chatroom-1': 'MST',
  'SisterUnion007SouthWest-chatroom-2': 'MST',
  'SisterUnion007SouthWest-chatroom-3': 'MST',
  'SisterUnion008NorthWest-chatroom-1': 'PST',
  'SisterUnion008NorthWest-chatroom-2': 'PST',
  'SisterUnion008NorthWest-chatroom-3': 'PST',
  'SisterUnion009International-chatroom-1': 'EST',
  'SisterUnion009International-chatroom-2': 'EST',
  'SisterUnion009International-chatroom-3': 'EST',
  'SisterUnion010TheGreatHall-chatroom-1': 'EST',
  'SisterUnion010TheGreatHall-chatroom-2': 'EST',
  'SisterUnion010TheGreatHall-chatroom-3': 'EST',
  'SisterUnion011WaterFall-chatroom-1': 'EST',
  'SisterUnion011WaterFall-chatroom-2': 'EST',
  'SisterUnion011WaterFall-chatroom-3': 'EST',
  'SisterUnion012UnionEvent-chatroom-1': 'EST',
  'SisterUnion012UnionEvent-chatroom-2': 'EST',
  'SisterUnion012UnionEvent-chatroom-3': 'EST',
  'SisterUnion013UnionSupport-chatroom-1': 'EST',
  'SisterUnion013UnionSupport-chatroom-2': 'EST',
  'SisterUnion013UnionSupport-chatroom-3': 'EST',
  'SisterUnion014UnionNews-chatroom-1': 'MST',
  'SisterUnion014UnionNews-chatroom-2': 'MST',
  'SisterUnion014UnionNews-chatroom-3': 'MST',
  'SisterUnion015UnionRadio-chatroom-1': 'MST',
  'SisterUnion015UnionRadio-chatroom-2': 'MST',
  'SisterUnion015UnionRadio-chatroom-3': 'MST',
  'SisterUnion016UnionDrive-chatroom-1': 'EST',
  'SisterUnion016UnionDrive-chatroom-2': 'EST',
  'SisterUnion016UnionDrive-chatroom-3': 'EST',
  'SisterUnion017UnionArchiveAndEducation-chatroom-1': 'EST',
  'SisterUnion017UnionArchiveAndEducation-chatroom-2': 'EST',
  'SisterUnion017UnionArchiveAndEducation-chatroom-3': 'EST',
  'SisterUnion018UnionTech-chatroom-1': 'EST',
  'SisterUnion018UnionTech-chatroom-2': 'EST',
  'SisterUnion018UnionTech-chatroom-3': 'EST',
  'SisterUnion019UnionPolitic-chatroom-1': 'EST',
  'SisterUnion019UnionPolitic-chatroom-2': 'EST',
  'SisterUnion019UnionPolitic-chatroom-3': 'EST',
  'SisterUnion020UnionSAM-chatroom-1': 'EST',
  'SisterUnion020UnionSAM-chatroom-2': 'EST',
  'SisterUnion020UnionSAM-chatroom-3': 'EST',
  'SisterUnion021UnionUkraineAndTheCrystalPalace-chatroom-1': 'EST',
  'SisterUnion021UnionUkraineAndTheCrystalPalace-chatroom-2': 'EST',
  'SisterUnion021UnionUkraineAndTheCrystalPalace-chatroom-3': 'EST',
  'SisterUnion022FestyLove-chatroom-1': 'EST',
  'SisterUnion022FestyLove-chatroom-2': 'EST',
  'SisterUnion022FestyLove-chatroom-3': 'EST',
  'SisterUnion023UnionLegal-chatroom-1': 'EST',
  'SisterUnion023UnionLegal-chatroom-2': 'EST',
  'SisterUnion023UnionLegal-chatroom-3': 'EST',
  'SisterUnion024UnionMarket-chatroom-1': 'EST',
  'SisterUnion024UnionMarket-chatroom-2': 'EST',
  'SisterUnion024UnionMarket-chatroom-3': 'EST',
  'SisterUnion025UnionArena-chatroom-1': 'EST',
  'SisterUnion025UnionArena-chatroom-2': 'EST',
  'SisterUnion025UnionArena-chatroom-3': 'EST',
  'SisterUnion026UnionTradeEnergyAndCommunityWIFI-chatroom-1': 'EST',
  'SisterUnion026UnionTradeEnergyAndCommunityWIFI-chatroom-2': 'EST',
  'SisterUnion026UnionTradeEnergyAndCommunityWIFI-chatroom-3': 'EST',
  'SisterUnion027Secret027-chatroom-1': 'EST',
  'SisterUnion027Secret027-chatroom-2': 'EST',
  'SisterUnion027Secret027-chatroom-3': 'EST',
  'SisterUnion028Sports-chatroom-1': 'EST',
  'SisterUnion028Sports-chatroom-2': 'EST',
  'SisterUnion028Sports-chatroom-3': 'EST',
  'SisterUnion029WheelsVehiclesAndeMods-chatroom-1': 'EST',
  'SisterUnion029WheelsVehiclesAndeMods-chatroom-2': 'EST',
  'SisterUnion029WheelsVehiclesAndeMods-chatroom-3': 'EST',
  'SisterUnion030HousingAndHealthCare-chatroom-1': 'EST',
  'SisterUnion030HousingAndHealthCare-chatroom-2': 'EST',
  'SisterUnion030HousingAndHealthCare-chatroom-3': 'EST',
};

// Convert timezone offset to hours
function getTimezoneOffset(timezone: string): number {
  const offsets: Record<string, number> = {
    'EST': -5,
    'CST': -6,
    'MST': -7,
    'PST': -8,
  };
  return offsets[timezone] || 0;
}

// Get timezone for a room
function getTimezoneForRoom(room: string): string {
  return roomTimezoneMap[room] || 'EST';
}

// Check if we need to archive messages (if midnight has passed in the room's timezone)
async function checkAndArchiveIfNeeded(room: string): Promise<boolean> {
  try {
    const timezone = getTimezoneForRoom(room);
    
    const resetRecord = await db
      .selectFrom('chat_reset_schedule')
      .where('room', '=', room)
      .selectAll()
      .executeTakeFirst();
    
    if (!resetRecord) {
      console.log(`[CHAT ARCHIVE] No reset record for ${room}`);
      return false;
    }

    const lastReset = new Date(resetRecord.last_reset_at);
    const now = new Date();
    
    // Get current time in the room's timezone
    const offset = getTimezoneOffset(timezone);
    const tzNow = new Date(now.getTime() + (offset * 60 * 60 * 1000));
    const tzLastReset = new Date(lastReset.getTime() + (offset * 60 * 60 * 1000));
    
    // Check if dates differ (midnight has passed)
    const nowDate = tzNow.toISOString().split('T')[0];
    const lastResetDate = tzLastReset.toISOString().split('T')[0];
    
    if (nowDate !== lastResetDate) {
      console.log(`[CHAT ARCHIVE] Archiving ${room} (${timezone})`);
      
      // Get all current messages for this room
      const messages = await db
        .selectFrom('messages')
        .where('room', '=', room)
        .selectAll()
        .execute();
      
      if (messages.length > 0) {
        // Archive them
        await db
          .insertInto('chat_message_archives')
          .values({
            room,
            archived_messages: JSON.stringify(messages),
            archived_at: new Date().toISOString(),
          })
          .execute();
        
        console.log(`[CHAT ARCHIVE] Archived ${messages.length} messages for ${room}`);
        
        // Delete messages from current table
        await db
          .deleteFrom('messages')
          .where('room', '=', room)
          .execute();
        
        console.log(`[CHAT ARCHIVE] Cleared current messages for ${room}`);
      }
      
      // Update last reset time
      await db
        .updateTable('chat_reset_schedule')
        .set({ last_reset_at: new Date().toISOString() })
        .where('room', '=', room)
        .execute();
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`[CHAT ARCHIVE] Error checking archive for ${room}:`, error);
    return false;
  }
}

// Get base room name from full room name (removes -chatroom-X)
function getBaseRoom(room: string): string {
  return room.replace(/-chatroom-\d+$/, '');
}

// ===============================================
// MAIN SETUP FUNCTION
// ===============================================

export function setupChat(io: SocketIOServer) {
  const usersInRooms: Record<string, Record<string, { username: string }>> = {};
  let anonymousCounter = 0;

  io.use((socket: SocketWithUser, next) => {
    // Try to get token from auth object first (most reliable)
    let token = (socket.handshake.auth as any)?.token;

    // If no token in auth, try cookie
    if (!token) {
      const cookie = socket.handshake.headers.cookie;
      if (cookie) {
        token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      }
    }

    // If no token in cookie, try Authorization header
    if (!token) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
        socket.user = payload;
        console.log(`[CHAT] User authenticated via socket: ID=${payload.userId}, Username=${payload.username}`);
        return next();
      } catch (err) {
        console.log('[CHAT] Invalid token, treating as anonymous');
      }
    }

    // Assign an anonymous ID if not logged in
    anonymousCounter++;
    socket.anonymousId = `Anonymous${String(anonymousCounter).padStart(3, '0')}`;
    console.log(`[CHAT] User joining as anonymous: ${socket.anonymousId}`);
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
      
      // Check and archive if needed (at midnight based on timezone)
      const archived = await checkAndArchiveIfNeeded(room);
      if (archived) {
        // Notify clients that messages have been cleared
        io.to(room).emit('messagesCleared');
      }

      try {
        // Get timezone for this room
        const timezone = getTimezoneForRoom(room);
        const offset = getTimezoneOffset(timezone);
        
        // Get today's date in the room's timezone
        const now = new Date();
        const tzNow = new Date(now.getTime() + (offset * 60 * 60 * 1000));
        const todayDateStr = tzNow.toISOString().split('T')[0]; // YYYY-MM-DD
        const tomorrowDateStr = new Date(tzNow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Load messages from TODAY ONLY
        const messages = await db
          .selectFrom('messages')
          .leftJoin('users', 'users.id', 'messages.user_id')
          .where('room', '=', room)
          .where('timestamp', '>=', `${todayDateStr}T00:00:00`)
          .where('timestamp', '<', `${tomorrowDateStr}T00:00:00`)
          .orderBy('timestamp', 'asc')
          .select([
            'messages.id',
            'messages.content',
            'messages.is_anonymous',
            'messages.timestamp',
            'users.username',
            'messages.anonymous_username'
          ])
          .execute();
        
        console.log(`[CHAT] Loaded ${messages.length} messages for today in ${room}`);
        
        const formattedMessages = messages.map(msg => {
          let displayUsername: string;
          
          if (msg.is_anonymous || !msg.username) {
            displayUsername = msg.anonymous_username || 'Anonymous';
          } else {
            displayUsername = msg.username;
          }
          
          return {
            id: msg.id,
            content: msg.content,
            username: displayUsername,
            is_anonymous: msg.is_anonymous,
            timestamp: msg.timestamp,
          };
        });

        socket.emit('loadMessages', formattedMessages);
      } catch (error) {
        console.error(`Error loading messages for room ${room}:`, error);
      }
    });

    // NEW: Load archived messages
    socket.on('loadArchivedMessages', async (data: { room: string; offset: number }) => {
      const { room, offset } = data;
      
      try {
        // Get archived messages for this room, ordered by date descending (most recent first)
        const archives = await db
          .selectFrom('chat_message_archives')
          .where('room', '=', room)
          .orderBy('archived_at', 'desc')
          .select(['id', 'archived_messages', 'archived_at'])
          .execute();
        
        // Skip to the offset archive batch
        const archive = archives[offset];
        
        if (archive) {
          const messages = JSON.parse(archive.archived_messages);
          
          // Format messages
          const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            username: msg.anonymous_username || 'Anonymous',
            is_anonymous: msg.is_anonymous === 1,
            timestamp: msg.timestamp,
          }));
          
          socket.emit('loadedArchivedMessages', {
            messages: formattedMessages,
            hasMore: offset < archives.length - 1,
            offset: offset + 1,
            archivedAt: archive.archived_at,
          });
        } else {
          socket.emit('loadedArchivedMessages', {
            messages: [],
            hasMore: false,
            offset: offset,
          });
        }
      } catch (error) {
        console.error(`Error loading archived messages for ${room}:`, error);
        socket.emit('error', { message: 'Failed to load archived messages' });
      }
    });

    socket.on('sendMessage', async (data: { room: string; content: string; isAnonymous: boolean }) => {
      const { room, content, isAnonymous } = data;
      
      try {
        let userId: number | null = null;
        let anonymousUsername: string | null = null;
        let isAnon = 0;
        
        // DETERMINE WHO IS SENDING THE MESSAGE
        if (socket.user) {
          // LOGGED-IN USER
          userId = socket.user.userId;
          if (isAnonymous) {
            // They clicked "Post Anonymously?" - mark as anonymous
            isAnon = 1;
            anonymousUsername = socket.anonymousId || `Anonymous${anonymousCounter}`;
          } else {
            // They did NOT click "Post Anonymously?" - post as themselves
            isAnon = 0;
            anonymousUsername = null;  // No anonymous name needed
          }
        } else {
          // NOT LOGGED-IN USER - Always anonymous
          userId = null;
          isAnon = 1;
          anonymousUsername = socket.anonymousId || `Anonymous${anonymousCounter}`;
        }

        // Save message to database
        const newMessage = await db
          .insertInto('messages')
          .values({
            content,
            room,
            user_id: userId,
            is_anonymous: isAnon as any,
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
