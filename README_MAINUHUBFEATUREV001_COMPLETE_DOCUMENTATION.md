# MainUhubFeatureV001 - Complete Documentation & Resource Index

Complete reference guide for all MainUhubFeatureV001 documentation, setup instructions, and integration guides.

---

## 📚 Documentation Files Reference

### **Core Setup & Deployment**

#### 1. `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`
- **Purpose**: Complete Docker, deployment, and production setup
- **Includes**:
  - Dockerfile configuration
  - Docker Compose setup for local and production
  - Nginx configuration
  - MySQL/SQLite database setup
  - Package.json dependencies verification
  - Database connection instructions
  - Logged-in user authentication flow
  - Post anonymously feature setup
  - Store creation and product management
  - Docker volumes and networking
  - Docker image and container creation

**Use this when:**
- Setting up the application for the first time
- Deploying to production
- Configuring Docker containers
- Setting up database connections
- Troubleshooting deployment issues

---

### **Code Documentation**

#### 2. `README_MAINUHUBFEATUREV001_CODE_COMMENTS_GUIDE.md`
- **Purpose**: Explains all inline code comments throughout the application
- **Includes**:
  - Server-side code breakdown (/server/index.ts, auth.ts, chat.ts)
  - Client-side component explanation (ChatModal, useAuth hook)
  - Database structure and queries
  - Troubleshooting guide using code comments
  - How to interpret and use comments for debugging
  - Best practices for writing code comments

**Use this when:**
- Debugging issues in the code
- Understanding code behavior
- Modifying existing code
- Onboarding new developers
- Troubleshooting specific features

**Key Files Documented:**
- ✅ `/server/index.ts` - Express server setup
- ✅ `/server/auth.ts` - Authentication (login, signup, logout)
- ✅ `/server/chat.ts` - Real-time chat with Socket.IO
- ✅ `/client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx` - Chat UI
- ✅ `/client/src/hooks/useAuth.tsx` - Authentication hook

---

### **Naming Conventions**

#### 3. `README_MAINUHUBFEATUREV001_NAMING_CONVENTIONS.md`
- **Purpose**: Ensures all code uses MainUhubFeatureV001 prefix for merge safety
- **Includes**:
  - CSS class naming conventions
  - JavaScript variable/function naming
  - React component naming
  - Database table naming
  - Route naming
  - ID attribute naming
  - Prefixing strategy to avoid conflicts

**Use this when:**
- Creating new components
- Writing CSS classes
- Adding new routes
- Creating database tables
- Before merging to main codebase

**Naming Pattern:** `MainUhubFeatureV001For{FeatureName}{Component/Function}`

---

### **WooCommerce Integration**

#### 4. `README_MAINUHUBFEATUREV001_WOOCOMMERCE_INTEGRATION.md`
- **Purpose**: Connect MainUhubFeatureV001 products to Hostinger WooCommerce store
- **Includes**:
  - WooCommerce store setup on Hostinger
  - Child theme creation and customization
  - Product synchronization (SKU-based and API)
  - Database integration (SQLite to MySQL)
  - Cart and checkout integration
  - WordPress REST API setup
  - Plugin recommendations
  - Troubleshooting WooCommerce sync
  - Docker integration for WooCommerce

**Use this when:**
- Connecting to a WooCommerce store
- Syncing products between systems
- Setting up SKU-based product linking
- Creating WordPress child themes
- Configuring cart functionality

**Key Endpoints:**
- `GET /wp-json/mainuhubfeaturev001/v1/products` - All products
- `GET /wp-json/mainuhubfeaturev001/v1/products/sku/{sku}` - Product by SKU
- `POST /wp-json/mainuhubfeaturev001/v1/add-to-cart` - Add to cart

---

### **Environment & Setup**

#### 5. `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md`
- **Purpose**: Environment variables and local development setup
- **Includes**:
  - .env file configuration
  - All required environment variables
  - JWT secret setup
  - Database path configuration
  - Socket.IO port configuration
  - WooCommerce API credentials
  - Development vs. production settings

**Use this when:**
- Setting up development environment
- Configuring production deployment
- Adding new environment variables
- Troubleshooting connection issues

**Required Variables:**
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-key-min-32-chars
DATABASE_URL=data/database.sqlite
VITE_PORT=3000
WC_API_URL=https://yourstore.com/wp-json/wc/v3
WC_CONSUMER_KEY=ck_xxxxx
WC_CONSUMER_SECRET=cs_xxxxx
```

---

### **Docker & Networking**

#### 6. `README_MAINUHUBFEATUREV001_DOCKER_VOLUMES_NETWORKING.md`
- **Purpose**: Docker volumes, networking, and container management
- **Includes**:
  - Volume setup for persistent data
  - Docker network configuration
  - Container communication
  - Database persistence with volumes
  - Hostinger File Manager integration
  - Docker Compose networking
  - Port mapping configuration

**Use this when:**
- Configuring Docker volumes
- Setting up container networking
- Persisting data in containers
- Troubleshooting container communication

---

### **Future Features**

#### 7. `README_MAINUHUBFEATUREV001_POTENTIAL_FUTURE_FEATURES.md`
- **Purpose**: List of potential features to implement in future versions
- **Includes**:
  - Chat features (direct messaging, typing indicators, read receipts)
  - User profile enhancements
  - Product store improvements
  - Social features (followers, notifications)
  - Admin dashboard
  - Analytics and reporting
  - Mobile app consideration
  - Payment processing
  - Real-time notifications

**Use this when:**
- Planning next development phase
- Gathering feature requests
- Creating development roadmap
- Prioritizing improvements

---

## 🔧 Quick Reference Guides

### Starting the Application

**Development Mode:**
```bash
# Start frontend dev server (http://localhost:3000)
npm run dev

# In another terminal, start Express server (http://localhost:3001)
npm run server:dev
```

**Production Mode:**
```bash
# Build frontend
npm run build

# Start production server (http://localhost:4000)
npm run build && npm start
```

---

### Database Queries

**Check message count:**
```sql
SELECT COUNT(*) FROM messages;
```

**Find messages by room:**
```sql
SELECT * FROM messages WHERE room = 'SisterUnion001-chatroom-1';
```

**Find messages by user:**
```sql
SELECT * FROM messages WHERE user_id = 1 AND is_anonymous = 0;
```

---

### Socket.IO Events Reference

**Client → Server:**
- `joinRoom` - Join a chat room
- `sendMessage` - Send a message to room
- `leaveRoom` - Leave a chat room

**Server → Client:**
- `loadMessages` - Load previous messages when joining room
- `receiveMessage` - New message received
- `updateUserList` - Updated list of users in room
- `error` - Error message

---

### Authentication Flow

```
User Signup → Hash Password → Create User in DB → Generate JWT → Set Cookie
                                                          ↓
User Login  → Hash Password → Verify Password → Generate JWT → Set Cookie
                                                          ↓
API Request → Read JWT from Cookie → Verify Token → Access Protected Routes
                                                          ↓
Logout → Clear Cookie from DB → Clear User State → Redirect to Login
```

---

### Component Structure

```
App (Auth Provider)
├── Header (Login/Signup Buttons)
├── Main Routes
│   └── MainUhubFeatureV001ForMyProfileModal
│       ├── Chat Modal List (#01-#24)
│       │   └── MainUhubFeatureV001ForChatModal
│       │       ├── 7 Chat Tabs
│       │       ├── Messages Display
│       │       ├── Users Online
│       │       ├── Message Input
│       │       └── Modal Options
│       ├── Friends View
│       ├── Broadcasts View
│       ├── Settings View
│       └── Product Store
│           ├── UnionSAM#20
│           ├── UnionPolitic#19
│           └── UnionEvent#12
└── Footer (Social Links)
```

---

## 🚀 Key Features

### Chat System
- ✅ 24 separate chat rooms (Sister Unions)
- ✅ 7 chat rooms per modal
- ✅ Password-protected chat (#3)
- ✅ Login-required chats (#2, #4, #5, #6, #7)
- ✅ Anonymous posting option
- ✅ Real-time user list
- ✅ Message persistence
- ✅ Draggable chat/users panel divider

### Authentication
- ✅ User signup with validation
- ✅ Secure password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ HTTPOnly cookie storage
- ✅ Auto-username prefixing (add 'u')
- ✅ Session management

### Store/Products
- ✅ Product listings by category
- ✅ Add to cart functionality
- ✅ Price display
- ✅ Product details modal
- ✅ WooCommerce integration via SKU
- ✅ Multiple store sections

### User Features
- ✅ User profiles
- ✅ Friend requests
- ✅ User search in chats
- ✅ Profile viewing from chats
- ✅ Online status indicator

---

## 📋 File Checklist for Deployment

Before deploying, verify these files are prefixed with `MainUhubFeatureV001`:

### Frontend Components
- ✅ MainUhubFeatureV001ForChatModal.tsx
- ✅ MainUhubFeatureV001ForMyProfileModal.tsx
- ✅ MainUhubFeatureV001ForAddProductModal.tsx
- ✅ MainUhubFeatureV001ForProductDetailModal.tsx
- ✅ MainUhubFeatureV001ForFriendsView.tsx
- ✅ MainUhubFeatureV001ForSettingsView.tsx
- ✅ MainUhubFeatureV001ForSisterUnionRoutes.tsx

### Backend Files
- ✅ auth.ts (authentication routes)
- ✅ chat.ts (socket.io handlers)
- ✅ friends.ts (friend routes)
- ✅ db.ts (database setup)
- ✅ index.ts (server entry)

### CSS/ID Attributes
- ✅ All CSS classes prefixed: `.mainuhubfeaturev001-*`
- ✅ All IDs prefixed: `id="MainUhubFeatureV001For*"`
- ✅ Tailwind classes using proper spacing

---

## 🐛 Troubleshooting Quick Links

| Issue | Document | Section |
|-------|----------|---------|
| Chat not connecting | CODE_COMMENTS_GUIDE | Socket.IO Setup |
| Messages not sending | CODE_COMMENTS_GUIDE | Message Handling |
| Users not appearing | CODE_COMMENTS_GUIDE | User List Updates |
| Login failing | DEPLOYMENT_GUIDE | Authentication |
| Products not syncing | WOOCOMMERCE_INTEGRATION | Product Sync |
| Docker issues | DOCKER_VOLUMES_NETWORKING | Volume Setup |
| Env variables missing | ENVIRONMENT_SETUP | Required Variables |

---

## 📞 Support & Debugging

### Enable Debug Logging

**Client (Browser Console):**
```javascript
// Check Socket.IO connection
console.log(socket.connected);

// Check auth state
useAuth(); // See user object
```

**Server (Terminal):**
```bash
# Already enabled in db.ts and index.ts
# Logs show: "Connected to socket server", "User joined room", etc.
```

### Common Errors & Solutions

**"You must be logged in to access this chatroom"**
- Solution: Click "Log In?" to authenticate
- Code: `/client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx` line 129

**"This chatroom is password protected"**
- Solution: Enter password "uminion"
- Code: `/client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx` line 85

**Products not showing**
- Solution: Check `/client/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx` line 167-185

**Messages not persisting**
- Solution: Check database connection in `/server/db.ts`

---

## 🔐 Security Notes

### Password Security
- Passwords are hashed with bcryptjs (salt rounds: 10)
- Never store plain text passwords
- Never log passwords in console

### JWT Security
- JWT tokens expire after 24 hours
- Tokens stored in httpOnly cookies (safe from XSS)
- Token verified on every API call
- Change JWT_SECRET in production to strong random value

### Anonymous Posts
- Anonymous users can post in all chats
- "Post Anonymously?" toggles visibility of username
- Anonymous posts displayed in orange color
- Anonymous users assigned ID (Anonymous001, etc.)

---

## 📊 Database Schema Summary

| Table | Purpose | Key Columns |
|-------|---------|------------|
| users | User accounts | id, username, password_hash, email |
| messages | Chat messages | id, content, room, user_id, is_anonymous |
| friends | Friend relationships | id, user_id1, user_id2, status |
| blocked_users | Blocked users | blocker_id, blocked_id |
| reports | User reports | reporter_id, reported_id, reason |

---

## 🎯 Development Workflow

1. **Understand the feature** - Read relevant documentation
2. **Check code comments** - See how similar features work
3. **Verify naming** - Use MainUhubFeatureV001 prefix
4. **Make changes** - Follow existing patterns
5. **Test locally** - Run dev server and test
6. **Check prefixes** - Ensure all code uses prefix
7. **Commit** - Clear, descriptive commit message
8. **Deploy** - Follow deployment guide

---

## 📝 Version History

- **v1.0.0** (Current)
  - Initial release
  - 24 chat rooms (Sister Unions)
  - Product store integration
  - User authentication
  - WooCommerce support
  - Complete documentation

---

## 🤝 Contributing

When contributing to MainUhubFeatureV001:

1. **Read all documentation** first
2. **Follow naming conventions** strictly
3. **Add/update code comments** explaining changes
4. **Update relevant README** files
5. **Test thoroughly** before committing
6. **Use prefixed names** for all code
7. **Test on mobile, tablet, desktop**

---

## 📬 Support Resources

- **Code Comments**: `README_MAINUHUBFEATUREV001_CODE_COMMENTS_GUIDE.md`
- **Deployment**: `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`
- **WooCommerce**: `README_MAINUHUBFEATUREV001_WOOCOMMERCE_INTEGRATION.md`
- **Setup**: `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md`
- **Docker**: `README_MAINUHUBFEATUREV001_DOCKER_VOLUMES_NETWORKING.md`
- **Future Ideas**: `README_MAINUHUBFEATUREV001_POTENTIAL_FUTURE_FEATURES.md`

---

**Last Updated:** 2025
**Version:** 1.0.0
**Status:** Production Ready
**Maintained by:** MainUhubFeatureV001 Development Team

For questions or issues, refer to the appropriate documentation guide above.
