
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth.tsx';
import { ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';

interface MainHubUpgradeV001ForChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageName: string;
  backgroundColor: string;
  modalNumber: number;
}

interface Message {
  id: number;
  content: string;
  username: string;
  is_anonymous: boolean;
  timestamp: string;
}

interface User {
  username: string;
}

const MainHubUpgradeV001ForChatModal: React.FC<MainHubUpgradeV001ForChatModalProps> = ({
  isOpen,
  onClose,
  pageName,
  backgroundColor,
  modalNumber,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [modalOptionPage, setModalOptionPage] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const correctPassword = 'uminion';
  const roomName = `${pageName}-chatroom-${activeTab + 1}`;

  const restrictedTabs = [1, 3, 4, 5, 6]; // Indices: 2, 4, 5, 6, 7

  useEffect(() => {
    if (isOpen) {
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
        socketRef.current?.emit('joinRoom', roomName);
      });

      socketRef.current.on('loadMessages', (loadedMessages: Message[]) => {
        setMessages(loadedMessages);
      });

      socketRef.current.on('receiveMessage', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socketRef.current.on('updateUserList', (userList: User[]) => {
        setUsers(userList);
      });

      return () => {
        socketRef.current?.emit('leaveRoom', roomName);
        socketRef.current?.disconnect();
      };
    }
  }, [isOpen, roomName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTabClick = (index: number) => {
    if (restrictedTabs.includes(index) && !user) {
      alert('You must be logged in to access this chatroom.');
      return;
    }
    socketRef.current?.emit('leaveRoom', roomName);
    setActiveTab(index);
    setMessages([]);
    setUsers([]);
    setPassword('');
    if (index !== 2) {
      setIsUnlocked(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setIsUnlocked(true);
    } else {
      alert('Incorrect password');
    }
    setPassword('');
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('sendMessage', {
        room: roomName,
        content: newMessage,
        isAnonymous,
      });
      setNewMessage('');
    }
  };

  const modalOptions = Array.from({ length: 25 }, (_, i) => {
    if (i + 1 === 2) return "Post Anonymously?";
    return `Modal${String(modalNumber).padStart(3, '0')}Option${String(i + 1).padStart(3, '0')}`;
  });

  const visibleOptions = modalOptions.slice(modalOptionPage * 7, modalOptionPage * 7 + 7);

  const handleModalOptionClick = (option: string) => {
    if (option === "Post Anonymously?") {
      if (!user) {
        alert("You must be logged in to choose to post anonymously.");
        return;
      }
      setIsAnonymous(prev => !prev);
    }
  };

  const isChatDisabled = (activeTab === 2 && !isUnlocked) || (restrictedTabs.includes(activeTab) && !user);

  const getChatTabs = () => {
    let tabs = [...Array(7)].map((_, i) => ({
      label: `Chatroom ${i + 1}`,
      isProtected: i === 2,
      isLoginRequired: restrictedTabs.includes(i),
    }));

    if (modalNumber === 10) {
      tabs = tabs.slice(0, 3);
      tabs.push({ label: '+ User Created Chatrooms:>', isProtected: false, isLoginRequired: true });
    }
    return tabs;
  };

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
          <div className="flex-grow flex flex-col">
            <div className="flex border-b">
              {getChatTabs().map((tab, i) => (
                <Button
                  key={i}
                  variant={activeTab === i ? 'secondary' : 'ghost'}
                  className="rounded-none"
                  onClick={() => handleTabClick(i)}
                  disabled={tab.isLoginRequired && !user}
                >
                  {tab.label} {tab.isProtected ? ' (P)' : ''}
                </Button>
              ))}
            </div>

            <div className="flex-grow p-4 overflow-y-auto" ref={messagesEndRef}>
              {isChatDisabled ? (
                 <div className="flex flex-col items-center justify-center h-full">
                  {activeTab === 2 && !isUnlocked ? (
                    <>
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
                    </>
                  ) : (
                     <h3 className="text-lg font-semibold mb-4">
                        You must be logged in to access this chatroom.
                      </h3>
                  )}
                 </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id}>
                      <span className="font-bold">{msg.username}: </span>
                      <span className={msg.is_anonymous ? 'text-orange-500' : 'text-black'}>{msg.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isChatDisabled}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={isChatDisabled}>Send</Button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" onClick={() => setModalOptionPage(p => Math.max(0, p - 1))} disabled={modalOptionPage === 0}>
                  <ChevronLeft />
                </Button>
                {visibleOptions.map((option, i) => (
                  <Button
                    key={i}
                    variant={option === "Post Anonymously?" && isAnonymous ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleModalOptionClick(option)}
                  >
                    {option}
                  </Button>
                ))}
                <Button size="icon" variant="ghost" onClick={() => setModalOptionPage(p => Math.min(Math.ceil(25 / 7) - 1, p + 1))} disabled={modalOptionPage >= Math.floor(24 / 7)}>
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </div>

          <div className="w-1/4 border-l p-4 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Users Online</h3>
            <ul className="space-y-2">
              {users.map((u, i) => (
                <li key={i} className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <span>{u.username}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainHubUpgradeV001ForChatModal;
