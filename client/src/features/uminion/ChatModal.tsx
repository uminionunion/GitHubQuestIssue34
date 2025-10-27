
// Import React and its hooks.
import React, { useState } from 'react';
// Import Dialog components from the UI library.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Import other UI components.
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Define the props for the ChatModal component.
interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  backgroundColor: string;
}

// The main component for the chat modal.
const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  pageName,
  backgroundColor,
}) => {
  // State to manage the active tab.
  const [activeTab, setActiveTab] = useState(0);
  // State for the password input.
  const [password, setPassword] = useState('');
  // State to track if the password for the protected tab is correct.
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Hardcoded password for the third tab.
  const correctPassword = 'uminion';

  // Function to handle tab clicks.
  const handleTabClick = (index: number) => {
    setActiveTab(index);
    // Reset password state when switching tabs.
    setPassword('');
    if (index !== 2) {
      setIsUnlocked(false);
    }
  };

  // Function to handle password submission.
  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setIsUnlocked(true);
    } else {
      alert('Incorrect password');
    }
    setPassword('');
  };

  // A list of dummy usernames for the user list.
  const users = ['User1', 'User2', 'User3', 'User4', 'User5'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl h-[80vh] flex flex-col p-0"
        style={{ backgroundColor }}
      >
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{pageName} Chat</DialogTitle>
        </DialogHeader>
        <div className="flex-grow flex overflow-hidden">
          {/* Main chat area */}
          <div className="flex-grow flex flex-col">
            {/* Tabs for different chatrooms */}
            <div className="flex border-b">
              {[...Array(7)].map((_, i) => (
                <Button
                  key={i}
                  variant={activeTab === i ? 'secondary' : 'ghost'}
                  className="rounded-none"
                  onClick={() => handleTabClick(i)}
                >
                  Chatroom {i + 1} {i === 2 ? ' (Protected)' : ''}
                </Button>
              ))}
            </div>

            {/* Chat content based on active tab */}
            <div className="flex-grow p-4 overflow-y-auto">
              {activeTab === 2 && !isUnlocked ? (
                // Password prompt for the protected tab
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-lg font-semibold mb-4">
                    This chatroom is password protected.
                  </h3>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button onClick={handlePasswordSubmit}>Enter</Button>
                  </div>
                </div>
              ) : (
                // The actual chatroom content
                <div>
                  <h2 className="text-xl font-bold mb-4">
                    Welcome to Chatroom {activeTab + 1}
                  </h2>
                  {/* Placeholder for chat messages */}
                  <div className="space-y-4">
                    <p>Chat message 1...</p>
                    <p>Chat message 2...</p>
                    <p>Chat message 3...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input area */}
            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type a message..."
                disabled={activeTab === 2 && !isUnlocked}
              />
              <Button disabled={activeTab === 2 && !isUnlocked}>Send</Button>
            </div>
          </div>

          {/* User list on the right side */}
          <div className="w-1/4 border-l p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Users Online</h3>
            <ul className="space-y-2">
              {users.map((user, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  {user}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
