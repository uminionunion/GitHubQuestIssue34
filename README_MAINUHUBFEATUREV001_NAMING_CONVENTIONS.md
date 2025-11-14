# MainUhubFeatureV001 - Naming Conventions & Merge Safety

## Overview

All code in this feature branch is prefixed with `MainUhubFeatureV001` to ensure safe merging into the main codebase without naming conflicts or CSS/class collisions.

---

## Naming Convention Standard

Every file, component, interface, class, and style should follow this pattern:

```
MainUhubFeatureV001<Purpose>
```

Examples:
- `MainUhubFeatureV001ForMyProfileModal.tsx`
- `MainUhubFeatureV001ForChatModal.tsx`
- `MainUhubFeatureV001ForAddProductModal.tsx`
- `MainUhubFeatureV001ForSettingsView.tsx`

---

## File Organization

### Frontend Components

**Location:** `/home/app/client/src/features/`

#### Profile Features
- `profile/MainUhubFeatureV001ForMyProfileModal.tsx` - User's own profile modal
- `profile/MainUhubFeatureV001ForUserProfileModal.tsx` - Other users' profile view
- `profile/MainUhubFeatureV001ForAddProductModal.tsx` - Add product to store
- `profile/MainUhubFeatureV001ForProductDetailModal.tsx` - View product details
- `profile/MainUhubFeatureV001ForSettingsView.tsx` - User settings
- `profile/MainUhubFeatureV001ForFriendsView.tsx` - Friends list
- `profile/CreateBroadcastView.tsx` - Create broadcast (legacy, no prefix needed)

#### Chat & Union Features
- `uminion/MainUhubFeatureV001ForChatModal.tsx` - Main chat modal with 24 rooms
- `uminion/MainUhubFeatureV001ForSisterUnionRoutes.tsx` - Chat routing
- `uminion/MainUhubFeatureV001ForUserProfileModal.tsx` - User profile in chat

#### Comparison with Upgrade Version
- `profile/MainHubUpgradeV001For*.tsx` - Older version (do not use)
- `uminion/MainHubUpgradeV001For*.tsx` - Older version (do not use)

### Backend Files

**Location:** `/home/app/server/`

- `index.ts` - Main Express server (no prefix needed, shared)
- `db.ts` - SQLite database setup (no prefix needed, shared)
- `db-types.ts` - Database type definitions (no prefix needed, shared)
- `auth.ts` - Authentication routes (no prefix needed, shared)
- `friends.ts` - Friends routes (no prefix needed, shared)
- `chat.ts` - Chat Socket.io setup (no prefix needed, shared)
- `auth-middleware.ts` - JWT authentication middleware (no prefix needed, shared)
- `store.ts` - Store/product routes (no prefix needed, shared)

**Note:** Backend files don't need the prefix because they contain shared business logic, not UI-specific code that could conflict.

### Main Application Entry

**Location:** `/home/app/client/src/`

- `App.tsx` - Uses `MainUhubFeatureV001Layout` component internally
- `main.tsx` - Entry point (no prefix needed, shared)
- `hooks/useAuth.tsx` - Authentication hook (no prefix needed, shared)
- `lib/utils.ts` - Utility functions (no prefix needed, shared)

---

## CSS & Tailwind Classes

All Tailwind classes are scoped through component-specific classNames. No custom CSS files use the prefix because:

1. **Component-Scoped:** Each component has its own className bindings
2. **Tailwind Only:** We use Tailwind CSS exclusively, no custom CSS
3. **No Conflicts:** Tailwind classes are utility-based, not named

Example (correct):
```tsx
<div className="flex gap-4 p-2 border rounded-lg">
  {/* Content */}
</div>
```

Not needed:
```tsx
/* DO NOT create custom CSS files with this naming */
.mainuhubfeaturev001-container { }
```

---

## Interface & Type Naming

When creating TypeScript interfaces, prefix them too:

```typescript
// Correct
interface MainUhubFeatureV001ForChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  backgroundColor: string;
  modalNumber: number;
}

// Wrong
interface ChatModalProps { }
```

---

## Function & Constant Naming

React functional components and exported functions should follow the same pattern:

```typescript
// Correct
const MainUhubFeatureV001ForChatModal = ({ isOpen, onClose }: MainUhubFeatureV001ForChatModalProps) => {
  // Component logic
};

export default MainUhubFeatureV001ForChatModal;

// Wrong
const ChatModal = () => { };
export default ChatModal;
```

---

## Directory Structure with Prefixes

```
/home/app/client/src/features/

profile/
├── CreateBroadcastView.tsx
├── MainUhubFeatureV001ForMyProfileModal.tsx
├── MainUhubFeatureV001ForUserProfileModal.tsx
├── MainUhubFeatureV001ForAddProductModal.tsx
├── MainUhubFeatureV001ForProductDetailModal.tsx
├── MainUhubFeatureV001ForFriendsView.tsx
├── MainUhubFeatureV001ForSettingsView.tsx
└── MainUhubFeatureV001ForStoreView.tsx

uminion/
├── MainUhubFeatureV001ForChatModal.tsx
├── MainUhubFeatureV001ForSisterUnionRoutes.tsx
└── MainUhubFeatureV001ForUserProfileModal.tsx

auth/
└── AuthModal.tsx
```

---

## Merge Safety Checklist

Before merging to main, verify:

- [ ] All React components start with `MainUhubFeatureV001For`
- [ ] All TypeScript interfaces are prefixed with `MainUhubFeatureV001For`
- [ ] All exported functions use the prefix when component-specific
- [ ] No legacy `MainHubUpgradeV001` files are imported
- [ ] Backend files (server/) don't need prefixes
- [ ] Shared hooks (useAuth) don't need prefixes
- [ ] Utility files don't need prefixes
- [ ] No custom CSS files with prefixes (use Tailwind only)
- [ ] All imports use relative paths, not `@/` aliases
- [ ] No CSS class name conflicts by using descriptive Tailwind classes

---

## Conflict Prevention Strategy

### Why This Naming Convention?

If code wasn't prefixed, merging could cause:

1. **Component Naming Conflicts**
   - In main: `const ChatModal = () => {}`
   - In feature: `const ChatModal = () => {}`
   - Result: CONFLICT AFTER MERGE

2. **CSS Class Conflicts**
   - Both define `.chat-modal` with different styles
   - Result: VISUAL BUGS after merge

3. **Type Definition Conflicts**
   - Both define `interface ChatModalProps`
   - Result: TYPE ERRORS after merge

### Solution: Unique Prefix

By using `MainUhubFeatureV001` prefix:
- In main: `const ChatModal = () => {}`
- In feature: `const MainUhubFeatureV001ForChatModal = () => {}`
- Result: NO CONFLICT - both can coexist safely

---

## File Naming Pattern Rules

### Components
```
MainUhubFeatureV001For[Purpose].tsx

Examples:
- MainUhubFeatureV001ForMyProfileModal.tsx
- MainUhubFeatureV001ForChatModal.tsx
- MainUhubFeatureV001ForAddProductModal.tsx
```

### Interfaces
```
interface MainUhubFeatureV001For[Purpose]Props { }

Examples:
- interface MainUhubFeatureV001ForChatModalProps { }
- interface MainUhubFeatureV001ForProductModalProps { }
```

### Not Needed (Shared Code)
```
- useAuth.tsx
- auth.ts
- db.ts
- utils.ts
- lib/
- components/ui/ (shadcn components)
```

---

## Verification Commands

To verify naming conventions in your code:

```bash
# Find all React components
find client/src/features -name "*.tsx" -type f

# Find all that start with MainUhubFeatureV001
find client/src/features -name "MainUhubFeatureV001*.tsx" -type f

# List all server files (these are shared, no prefix needed)
ls -la server/*.ts
```

---

## Examples of Correct vs Incorrect

### CORRECT

```typescript
// File: client/src/features/profile/MainUhubFeatureV001ForMyProfileModal.tsx

interface MainUhubFeatureV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
}

const MainUhubFeatureV001ForMyProfileModal: React.FC<MainUhubFeatureV001ForMyProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthModal
}) => {
  return (
    <div className="flex gap-4 p-4">
      {/* Component JSX */}
    </div>
  );
};

export default MainUhubFeatureV001ForMyProfileModal;
```

### INCORRECT

```typescript
// File: client/src/features/profile/MyProfileModal.tsx

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MyProfileModal = ({ isOpen, onClose }: MyProfileModalProps) => {
  return <div>{/* Component JSX */}</div>;
};

export default MyProfileModal;

// Problems:
// 1. File name doesn't have MainUhubFeatureV001 prefix
// 2. Interface doesn't have prefix
// 3. Component name doesn't have prefix
// 4. Will conflict with similar code in main branch
```

---

## Import Statements (Relative Paths Only)

All imports MUST use relative paths:

```typescript
// CORRECT - Relative imports
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';

// WRONG - Path aliases won't work in this project
import MainUhubFeatureV001ForChatModal from '@/features/uminion/MainUhubFeatureV001ForChatModal';
import { Button } from '@/components/ui/button';
```

---

## Summary Table

| Item | Requires Prefix | Example |
|------|-----------------|---------|
| React Components | Yes | `MainUhubFeatureV001ForChatModal.tsx` |
| Component Props Interfaces | Yes | `MainUhubFeatureV001ForChatModalProps` |
| React Hooks (new) | If specific | `useMainUhubFeatureV001Chat` |
| Shared Hooks | No | `useAuth` |
| Express Routes | No | `auth.ts`, `chat.ts` |
| Database Files | No | `db.ts` |
| Utility Files | No | `utils.ts` |
| Tailwind CSS Classes | No | Use standard Tailwind |
| shadcn Components | No | Already prefixed |

---

## When Merging to Main

This naming convention makes merging safe because:

1. **Zero Conflicts** - Unique names prevent direct collisions
2. **Easy Comparison** - Can keep both versions during transition
3. **Gradual Migration** - Replace old components one at a time
4. **Clear Ownership** - Everyone knows this is the new MainUhubFeatureV001 version
5. **Traceable History** - Git logs clearly show which version was used when

All code is properly prefixed for safe integration into the main codebase.
