# MainUhubFeatureV001 - Comprehensive Code Comments Guide

Complete documentation of inline code comments explaining each line of code for easy troubleshooting and diagnosis.

---

## Overview

This guide documents all the code comments throughout the MainUhubFeatureV001 application. Code comments are essential for:
- **Troubleshooting**: Quickly understand what code does when debugging issues
- **Maintenance**: Understand original intent when modifying code
- **Onboarding**: New developers can learn the codebase faster
- **Documentation**: Self-documenting code with inline explanations

---

## Server-Side Code Comments

### `/server/index.ts` - Main Server Entry Point

This file initializes the Express server with Socket.IO for real-time chat.

**Key Comments:**
- Express framework setup and middleware initialization
- HTTP server creation (required for Socket.IO WebSocket support)
- Socket.IO CORS configuration for frontend communication
- Environment variable loading from .env
- Middleware for parsing JSON and cookies
- API route mounting at `/api/auth` and `/api/friends`
- Chat setup initialization

**What Each Line Does:**
```typescript
// Express is a Node.js web framework for building REST APIs
import express from 'express';

// Load environment variables from .env (API keys, secrets, config)
dotenv.config();

// Create HTTP server (Socket.IO needs native HTTP, not just Express)
const server = http.createServer(app);

// Configure Socket.IO CORS to allow frontend connections
const io = new SocketIOServer(server, {
  cors: {
    origin: `http://localhost:${process.env.VITE_PORT || 3000}`,
    credentials: true, // Allow cookies/JWT in requests
  },
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount authentication routes at /api/auth endpoint
app.use('/api/auth', authRouter);
```

### `/server/auth.ts` - User Authentication

Handles user signup, login, logout, and JWT token management.

**Key Comments:**
- Password hashing with bcryptjs for security
- JWT token creation and signing
- User validation and duplicate checking
- Database queries for user lookup
- Cookie setting for token storage

**What Each Section Does:**
```typescript
// Signup endpoint - creates new user account
router.post('/signup', async (req, res) => {
  // Validate all required fields exist
  if (!username || !password || !email || !phoneNumber) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Auto-prefix username with 'u' (e.g., input: "John" -> "uJohn")
  const finalUsername = username.startsWith('u') ? username : `u${username}`;

  // Check if user already exists (by username, email, or phone)
  const existingUser = await db.selectFrom('users')
    .where((eb) => eb.or([
      eb('username', '=', finalUsername),
      eb('email', '=', email),
      eb('phone_number', '=', phoneNumber)
    ]))
    .executeTakeFirst();

  // Hash password (never store plain text passwords!)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user in database
  const newUser = await db.insertInto('users')
    .values({ username: finalUsername, password: hashedPassword, email, phone_number: phoneNumber })
    .returningAll()
    .executeTakeFirst();

  // Create JWT token (expires in 24 hours)
  const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, {
    expiresIn: '1d',
  });

  // Store token in httpOnly cookie (secure, inaccessible to JavaScript)
  res.cookie('token', token, { httpOnly: true });
});

// Login endpoint - authenticates user and returns token
router.post('/login', async (req, res) => {
  // Find user by username
  const user = await db.selectFrom('users')
    .where('username', '=', username)
    .executeTakeFirst();

  // Compare submitted password with hashed password in database
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create and return JWT token
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie('token', token, { httpOnly: true });
});

// Get current user endpoint - verifies token and returns user data
router.get('/me', (req, res) => {
  // Extract token from cookies
  const token = req.cookies.token;

  // Verify token signature and expiration
  const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };

  res.status(200).json({ id: payload.userId, username: payload.username });
});
```

### `/server/chat.ts` - Real-time Chat with Socket.IO

Manages WebSocket connections, chat rooms, messages, and user lists.

**Key Comments:**
- Socket.IO middleware for JWT authentication
- Room management (joinRoom, leaveRoom)
- Message persistence to database
- User list updates to room
- Anonymous user handling

**What Each Event Handler Does:**
```typescript
// Middleware: Authenticate socket connection before allowing events
io.use((socket: SocketWithUser, next) => {
  // Extract JWT token from cookies in WebSocket handshake
  const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

  if (token) {
    try {
      // Verify token - if valid, attach user data to socket
      const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
      socket.user = payload;
      return next(); // Allow connection as authenticated user
    } catch (err) {
      // Invalid/expired token - fall through to anonymous user
    }
  }

  // Assign anonymous ID for non-logged-in users (Anonymous001, Anonymous002, etc.)
  socket.anonymousId = `Anonymous${String(anonymousCounter).padStart(3, '0')}`;
  next(); // Allow connection as anonymous user
});

// joinRoom event: User enters a chat room
socket.on('joinRoom', async (room) => {
  // Add this socket to the room (Socket.IO feature)
  socket.join(room);

  // Add user to tracking object for this room
  usersInRooms[room][socket.id] = { username: displayName };

  // Broadcast updated user list to all users in room
  io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));

  // Query database for recent messages (up to 50)
  const messages = await db.selectFrom('messages')
    .leftJoin('users', 'users.id', 'messages.user_id')
    .where('room', '=', room)
    .orderBy('timestamp', 'asc')
    .limit(50)
    .execute();

  // Send loaded messages to joining user only (not broadcast)
  socket.emit('loadMessages', formattedMessages);
});

// sendMessage event: User sends a message to room
socket.on('sendMessage', async (data) => {
  const { room, content, isAnonymous } = data;

  // Validate: Non-logged-in users must post anonymously
  if (!socket.user && !isAnonymous) {
    socket.emit('error', 'Must be logged in for non-anonymous messages');
    return;
  }

  // Save message to database
  const newMessage = await db.insertInto('messages')
    .values({
      content,
      room,
      user_id: socket.user?.userId || null, // null if anonymous
      is_anonymous: socket.user ? (isAnonymous ? 1 : 0) : 1,
      anonymous_username: socket.user ? null : socket.anonymousId,
    })
    .returningAll()
    .executeTakeFirst();

  // Broadcast message to all users in room
  io.to(room).emit('receiveMessage', messageForClient);
});

// leaveRoom event: User exits a chat room
socket.on('leaveRoom', (room) => {
  // Remove socket from room
  socket.leave(room);

  // Remove user from tracking object
  delete usersInRooms[room][socket.id];

  // Notify remaining users of updated user list
  io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
});

// disconnect event: User disconnects from server
socket.on('disconnect', () => {
  // Remove user from all rooms they were in
  for (const room in usersInRooms) {
    if (usersInRooms[room][socket.id]) {
      delete usersInRooms[room][socket.id];
      io.to(room).emit('updateUserList', Object.values(usersInRooms[room]));
    }
  }
});
```

---

## Client-Side Code Comments

### `/client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx` - Chat Modal Component

React component for displaying chat functionality with 7 chatrooms per modal.

**Key Comments:**
- Socket.IO client setup and connection
- Message state management
- Password protection for chatroom #3
- Anonymous posting toggle
- User profile viewing
- Draggable divider for chat/users panel resizing
- Font and background color customization

**What Each Major Section Does:**
```typescript
// Initialize Socket.IO client connection on modal open
useEffect(() => {
  if (isOpen) {
    // Connect to Socket.IO server at http://localhost:3001
    socketRef.current = io('http://localhost:3001', {
      withCredentials: true, // Send cookies (JWT token) with connection
    });

    // On successful connection, emit joinRoom event
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('joinRoom', roomName);
    });

    // Receive loaded messages from server
    socketRef.current.on('loadMessages', (loadedMessages) => {
      setMessages(loadedMessages);
    });

    // Receive new messages in real-time
    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Receive updated user list
    socketRef.current.on('updateUserList', (userList) => {
      setUsers(userList);
    });

    // Cleanup: Leave room and disconnect when modal closes
    return () => {
      socketRef.current?.emit('leaveRoom', roomName);
      socketRef.current?.disconnect();
    };
  }
}, [isOpen, roomName]);

// Auto-scroll to bottom when new messages arrive
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// Handle tab/chatroom switching
const handleTabClick = (index: number) => {
  // Restricted tabs (1, 3, 4, 5, 6) require login
  if (restrictedTabs.includes(index) && !user) {
    alert('You must be logged in to access this chatroom.');
    return;
  }

  // Leave current room before switching
  socketRef.current?.emit('leaveRoom', roomName);

  // Update active tab and reset state
  setActiveTab(index);
  setMessages([]);
  setUsers([]);
  setPassword('');
};

// Handle password submission for chatroom #3
const handlePasswordSubmit = () => {
  if (password === correctPassword) {
    setIsUnlocked(true); // Allow access to protected chatroom
  } else {
    alert('Incorrect password');
  }
};

// Handle sending message via Socket.IO
const handleSendMessage = () => {
  if (newMessage.trim() && socketRef.current) {
    // Emit sendMessage event to server
    socketRef.current.emit('sendMessage', {
      room: roomName,
      content: newMessage,
      isAnonymous, // User preference: post anonymously or with username
    });
    setNewMessage(''); // Clear input field
  }
};

// Handle "Post Anonymously?" button toggle
const handleModalOptionClick = (option: string) => {
  if (option === "Post Anonymously?") {
    if (!user) {
      alert("Must be logged in to toggle anonymous posting");
      return;
    }
    // Toggle anonymous flag
    setIsAnonymous(prev => !prev);
  }
};

// Draggable divider for resizing chat/users panel
const handleDividerMouseDown = () => {
  setIsDraggingDivider(true);
};

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingDivider) return;

    // Calculate new chat panel width based on mouse position
    const rect = containerRef.current.getBoundingClientRect();
    const newChat = ((e.clientX - rect.left) / rect.width) * 100;

    // Constrain width between 30% and 85%
    if (newChat > 30 && newChat < 85) {
      setChatWidth(newChat);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingDivider(false);
  };

  // Add/remove event listeners based on dragging state
  if (isDraggingDivider) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [isDraggingDivider]);
```

### `/client/src/hooks/useAuth.tsx` - Authentication Hook

Custom hook for managing user authentication state across the app.

**Key Comments:**
- Context API setup for global auth state
- JWT token verification on app load
- Login/logout functions
- User data caching

**What Each Section Does:**
```typescript
// Create AuthContext for providing auth state to components
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component: Wraps app to provide auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load, check if user has valid JWT token
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Call /api/auth/me endpoint - verifies JWT in cookies
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          // JWT was valid - server returned user data
          const userData = await response.json();
          setUser(userData); // Set user globally
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        // User is not logged in or token expired
      } finally {
        setIsLoading(false); // Done checking auth status
      }
    };
    checkUser();
  }, []);

  // Login function: Update global user state
  const login = (userData: User) => {
    setUser(userData);
  };

  // Logout function: Call logout endpoint and clear user state
  const logout = async () => {
    try {
      // POST to /api/auth/logout - clears token cookie on server
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null); // Clear user state
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Provide auth state to all child components via context
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth state in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## Database Comments

### Message Table Structure

```sql
-- messages table: Stores all chat messages across all rooms
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,              -- The message text
  room TEXT NOT NULL,                 -- Room identifier (e.g., "SisterUnion001-chatroom-1")
  user_id INTEGER,                    -- User ID if logged in (NULL if anonymous)
  is_anonymous INTEGER DEFAULT 0,     -- 1 if posted anonymously, 0 if posted as username
  anonymous_username TEXT,            -- Anonymous ID (e.g., "Anonymous001") if not logged in
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Troubleshooting Guide Using Comments

### Issue: User Can't Send Messages

**Trace through code with comments:**

1. Check `/client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx`:
   - `handleSendMessage()` function - validates message not empty
   - `socketRef.current.emit('sendMessage', ...)` - sends to server

2. Check `/server/chat.ts`:
   - `socket.on('sendMessage', ...)` event handler
   - `if (!socket.user && !isAnonymous)` check - validates auth
   - `db.insertInto('messages')` - saves to database
   - `io.to(room).emit('receiveMessage', ...)` - broadcasts message

3. Check browser console for Socket.IO errors
4. Check server logs for database errors

### Issue: Anonymous Posts Not Showing

**Trace through code:**

1. Check `handleModalOptionClick('Post Anonymously?')` in ChatModal
   - Sets `isAnonymous` state

2. Check `handleSendMessage()` - passes `isAnonymous` to server

3. Check `/server/chat.ts` `sendMessage` event:
   - `is_anonymous: socket.user ? (isAnonymous ? 1 : 0) : 1` logic
   - For logged-in users: checks `isAnonymous` flag
   - For anonymous users: always sets `is_anonymous = 1`

4. Check message display in frontend:
   - `<span className={msg.is_anonymous ? 'text-orange-400' : ''}>`
   - Orange text indicates anonymous post

### Issue: User List Not Updating

**Trace through code:**

1. Check `socket.on('joinRoom', ...)` in server/chat.ts:
   - `usersInRooms[room][socket.id] = { username: displayName }`
   - `io.to(room).emit('updateUserList', Object.values(usersInRooms[room]))`

2. Check client listener in ChatModal:
   - `socketRef.current.on('updateUserList', (userList) => { setUsers(userList); })`

3. Check rendering:
   - `{users.map((u, i) => <div key={i}>{u.username}</div>)}`

---

## Best Practices for Code Comments

When adding new code, follow these comment patterns:

### For Imports
```typescript
// Import [library name] for [purpose]
// Example: // Import Socket.IO for real-time communication
import { ... } from '...';
```

### For Functions
```typescript
// [Function name] - [What it does]
// Called from [where it's called]
const functionName = () => {
  // [Action 1]: [Why we do this]
  // [Action 2]: [Why we do this]
};
```

### For Complex Logic
```typescript
// [Purpose of this block]
// Explanation of conditional or algorithm
if (condition) {
  // [Action if true]: [Why this action]
  doSomething();
}
```

### For State Variables
```typescript
// [State name] - [What does it track]
// Updated when: [list of events that update this]
const [stateName, setStateName] = useState(initialValue);
```

---

## Comment Locations in Each File

| File | Comment Coverage | Key Sections |
|------|-----------------|--------------|
| /server/index.ts | ✅ Full | Imports, middleware, routes |
| /server/auth.ts | ✅ Full | Signup, login, logout, JWT |
| /server/chat.ts | ✅ Full | Socket events, message handling |
| /client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx | ⚠️ Partial | Imports, interfaces, key functions |
| /client/src/hooks/useAuth.tsx | ✅ Full | Context, provider, hook |

---

## Tips for Debugging with Comments

1. **Read comments first** - Understand intended behavior
2. **Trace the flow** - Follow comments through function calls
3. **Check state management** - See what state is being updated
4. **Database queries** - Verify SQL matches what comments say
5. **Event handlers** - Confirm events are firing as expected
6. **Error logs** - Look for console/server errors that match comments

---

## Update Comments When

- ✅ Changing function behavior
- ✅ Adding new state variables
- ✅ Modifying database queries
- ✅ Changing event handler logic
- ✅ Updating Socket.IO events

## Never Remove Comments

Comments help with:
- Bug fixes by understanding original intent
- Code reviews to understand changes
- Onboarding new team members
- Troubleshooting production issues

---

**Last Updated:** 2025
**Version:** 1.0.0
**Maintained by:** MainUhubFeatureV001 Development Team
