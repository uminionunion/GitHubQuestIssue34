
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChatModalProps {
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

const ChatModal: React.FC<ChatModalProps> = ({
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
      setIsAnonymous(prev => !prev);
    }
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

            <div className="flex-grow p-4 overflow-y-auto" ref={messagesEndRef}>
              {activeTab === 2 && !isUnlocked ? (
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
                  disabled={(activeTab === 2 && !isUnlocked) || !user}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={(activeTab === 2 && !isUnlocked) || !user}>Send</Button>
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
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  {u.username}
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
