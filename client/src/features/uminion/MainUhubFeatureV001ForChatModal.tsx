
// Import React hooks for state management and lifecycle management
import React, { useState, useEffect, useRef } from 'react';
// Import Socket.IO for real-time chat functionality
import { io, Socket } from 'socket.io-client';
// Import UI components from shadcn/ui library
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
// Import shadcn Button component for interactive elements
import { Button } from '../../components/ui/button';
// Import shadcn Input component for text input fields
import { Input } from '../../components/ui/input';
// Import custom authentication hook to get logged-in user data
import { useAuth } from '../../hooks/useAuth';
// Import Lucide React icons for UI elements
import { ChevronLeft, ChevronRight, User as UserIcon, RefreshCw, Palette, Type, MessageSquare, UserPlus, UserX, ShieldAlert } from 'lucide-react';
// Import Popover component for context menus
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
// Import user profile modal component
import MainUhubFeatureV001ForUserProfileModal from '../profile/MainUhubFeatureV001ForUserProfileModal';

// Define the interface for component props passed from parent
interface MainUhubFeatureV001ForChatModalProps {
  // Controls if modal is visible (true) or hidden (false)
  isOpen: boolean;
  // Callback function to close the modal
  onClose: () => void;
  // Name of the page/chatroom (e.g., "SisterUnion001NewEngland")
  pageName: string;
  // CSS gradient background color for the chat modal
  backgroundColor: string;
  // Modal number (1-24) that identifies which Sister Union chatroom
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

const backgroundGradients = [
  'linear-gradient(to right, #232526, #414345)', 'linear-gradient(to right, #434343, #000000)',
  'linear-gradient(to right, #141e30, #243b55)', 'linear-gradient(to right, #3a6186, #89253e)',
  'linear-gradient(to right, #283048, #859398)', 'linear-gradient(to right, #0f2027, #203a43, #2c5364)',
  'linear-gradient(to right, #2c3e50, #4ca1af)', 'linear-gradient(to right, #1e130c, #9a8478)',
  'linear-gradient(to right, #16222a, #3a6073)', 'linear-gradient(to right, #360033, #0b8793)',
  'linear-gradient(to right, #333333, #dd1818)', 'linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d)',
  'linear-gradient(to right, #000000, #53346d)', 'linear-gradient(to right, #41295a, #2f0743)',
  'linear-gradient(to right, #1d2b64, #f8cdda)', 'linear-gradient(to right, #061161, #780206)',
  'linear-gradient(to right, #000428, #004e92)', 'linear-gradient(to right, #134e5e, #71b280)',
  'linear-gradient(to right, #2b5876, #4e4376)', 'linear-gradient(to right, #141e30, #243b55)',
  'linear-gradient(to right, #355c7d, #6c5b7b, #c06c84)', 'linear-gradient(to right, #20002c, #cbb4d4)',
  'linear-gradient(to right, #3c3b3f, #605c3c)', 'linear-gradient(to right, #3e5151, #decba4)',
  'linear-gradient(to right, #1c2331, #2a3a4f)', 'linear-gradient(to right, #283c86, #45a247)',
  'linear-gradient(to right, #000000, #434343)', 'linear-gradient(to right, #373b44, #4286f4)',
  'linear-gradient(to right, #414d0b, #727a17)', 'linear-gradient(to right, #2c3e50, #fd746c)',
];

const fontColors = ['#FFFFFF', '#E0E0E0', '#F5F5F5', '#B0BEC5', '#CFD8DC', '#ECEFF1', '#FFD180', '#C8E6C9', '#B3E5FC', '#D1C4E9'];

const MainUhubFeatureV001ForChatModal: React.FC<MainUhubFeatureV001ForChatModalProps> = (
   {
    isOpen,
    onClose,
    pageName,
    backgroundColor,
    modalNumber,
  }
) => {
const [activeTab, setActiveTab] = useState(0);
const [password, setPassword] = useState('');
const [isUnlocked, setIsUnlocked] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [archivedMessages, setArchivedMessages] = useState<Message[]>([]);
const [showArchive, setShowArchive] = useState(false);
const [archiveOffset, setArchiveOffset] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [modalOptionPage, setModalOptionPage] = useState(0);
  const [currentBg, setCurrentBg] = useState(backgroundColor);
  const [currentFontColor, setCurrentFontColor] = useState('#FFFFFF');
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [isProfileViewOpen, setProfileViewOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(70);
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

 const correctPassword = 'uminion';
 const roomName = `${pageName}-chatroom-${activeTab + 1}`;

 const restrictedTabs = [1, 3, 4, 5, 6];

 useEffect(() => {
   setCurrentBg(backgroundColor);
 }, [backgroundColor]);

 useEffect(() => {
   if (isOpen) {
  socketRef.current = io(
  process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:3001',
  {
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
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

const getChatroomDescription = (tabIndex: number): { title: string; access: string } | null => {
  // For Hub #10, only show descriptions for chatrooms 1-3 (indices 0-2)
  if (modalNumber === 10 && tabIndex > 2) {
    return null;
  }
  
  const descriptions: Record<number, { title: string; access: string }> = {
    0: { title: 'CH 1', access: 'All Topics & All Welcome (Logged-in & not-Logged-in)' },
    1: { title: 'CH 2', access: 'All Topics & Only Logged-in Users Welcome' },
    2: { title: 'CH 3', access: 'Only That \"Sister Union\"\\s Members allowed in (Password protected)' },
    3: { title: 'CH 4', access: 'All Topics & Only Logged-in Users Welcome' },
    4: { title: 'CH 5', access: 'All Topics & Only Logged-in Users Welcome' },
    5: { title: 'CH 6', access: 'All Topics & Only Logged-in Users Welcome' },
    6: { title: 'CH 7', access: 'Event Info/Updates & Where to go to Vote (on how the Union should move forward (Coming Soon))' },
  };
  return descriptions[tabIndex] || { title: `CH ${tabIndex + 1}`, access: 'Standard chatroom' };
};

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

 const changeBackgroundColor = () => {
   const randomIndex = Math.floor(Math.random() * backgroundGradients.length);
   setCurrentBg(backgroundGradients[randomIndex]);
 };

 const changeFontColor = () => {
   const randomIndex = Math.floor(Math.random() * fontColors.length);
   setCurrentFontColor(fontColors[randomIndex]);
 };

 const handleViewProfile = (username: string) => {
   setViewedUser({ username });
   setProfileViewOpen(true);
 };

  const handleDividerMouseDown = () => {
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newChat = ((e.clientX - rect.left) / rect.width) * 100;
      if (newChat > 30 && newChat < 85) {
        setChatWidth(newChat);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    if (isDraggingDivider) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDivider]);

 const isMobile = window.innerWidth < 768;

  return (
    <>
       <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent
            className={`${isMobile ? 'w-[95vw] h-[85vh]' : 'w-[95vw] h-[85vh]'} flex flex-col p-0 text-white`}
            style={{ background: currentBg }}
          >
          <DialogHeader className="p-4 border-b border-white/20 flex-row justify-between items-center flex-shrink-0">
            <DialogTitle style={{ color: currentFontColor }}>{pageName} Chat</DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={changeFontColor}><Type className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={changeBackgroundColor}><Palette className="h-4 w-4" /></Button>
            </div>
          </DialogHeader>
          <div className="flex-grow flex flex-col overflow-hidden">
            <div className="overflow-x-auto flex border-b border-white/20 flex-shrink-0">
              {getChatTabs().map((tab, i) => (
                <Button
                  key={i}
                  variant={activeTab === i ? 'secondary' : 'ghost'}
                  className="rounded-none text-white flex-shrink-0"
                  onClick={() => handleTabClick(i)}
                  disabled={tab.isLoginRequired && !user}
                >
                  {tab.label} {tab.isProtected ? ' (P)' : ''}
                </Button>
              ))}
            </div>

            <div className="flex-grow flex overflow-hidden" ref={containerRef}>
              <div className="overflow-y-auto p-4" style={{ width: `${chatWidth}%`, color: currentFontColor }}>
                {isChatDisabled ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    {activeTab === 2 && !isUnlocked ? (
                      <>
                        <h3 className="text-lg font-semibold mb-4">This chatroom is password protected.</h3>
                        <div className="flex gap-2">
                          <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                          <Button onClick={handlePasswordSubmit}>Enter</Button>
                        </div>
                      </>
                    ) : (
                      <h3 className="text-lg font-semibold mb-4">You must be logged in to access this chatroom.</h3>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id}>
                        <Popover>
                          <PopoverTrigger asChild>
                            <span className="font-bold cursor-pointer hover:underline">{msg.username}: </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-48">
                            <div className="grid gap-2">
                              <Button variant="ghost" className="justify-start" onClick={() => handleViewProfile(msg.username)}>View Profile</Button>
                              <Button variant="ghost" className="justify-start"><UserPlus className="mr-2 h-4 w-4" /> Add Friend</Button>
                              <Button variant="ghost" className="justify-start"><MessageSquare className="mr-2 h-4 w-4" /> Direct Message</Button>
                              <Button variant="ghost" className="justify-start"><UserX className="mr-2 h-4 w-4" /> Block/Ignore</Button>
                              <Button variant="destructive" className="justify-start"><ShieldAlert className="mr-2 h-4 w-4" /> Report</Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <span className={msg.is_anonymous ? 'text-orange-400' : ''}>{msg.content}</span>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div
                className="w-1 bg-white/30 hover:bg-white/50 cursor-col-resize flex-shrink-0 transition-colors"
                onMouseDown={handleDividerMouseDown}
              />

<div className="overflow-y-auto p-4 border-l border-white/20 flex-shrink-0" style={{ width: `${100 - chatWidth}%`, color: currentFontColor }}>
  {getChatroomDescription(activeTab) && (
    <div className="mb-6 pb-4 border-b border-white/20">
      <h2 className="font-bold text-sm mb-2">{getChatroomDescription(activeTab)!.title}</h2>
      <p className="text-xs text-gray-300 leading-relaxed">{getChatroomDescription(activeTab)!.access}</p>
    </div>
  )}
  
  <h3 className="font-bold mb-4 flex items-center gap-2">
    <UserIcon className="h-4 w-4" />
    Users Online
    {/* TO UNHIDE USER COUNT: Change the next line from "display: none" to "display: inline" */}
    <span style={{ display: 'none' }}>({users.length})</span>
  </h3>
  <div className="space-y-2">
    {users.map((u, i) => (
      <div key={i} className="text-sm hover:bg-white/10 p-2 rounded cursor-pointer transition-colors" onClick={() => handleViewProfile(u.username)}>
        {u.username}
      </div>
    ))}
  </div>
</div>
            </div>

            <div className="p-4 border-t border-white/20 flex flex-col gap-2 flex-shrink-0">
              <div className="flex gap-2">
                <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isChatDisabled} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="text-white" />
                <Button onClick={handleSendMessage} disabled={isChatDisabled}>Send</Button>
              </div>
              <div className="overflow-x-auto flex items-center justify-start gap-2 pb-2">
                <Button size="icon" variant="ghost" onClick={() => setModalOptionPage(p => Math.max(0, p - 1))} disabled={modalOptionPage === 0}><ChevronLeft /></Button>
                {visibleOptions.map((option, i) => (
                  <Button key={i} variant={option === "Post Anonymously?" && isAnonymous ? "secondary" : "outline"} size="sm" onClick={() => handleModalOptionClick(option)} className="flex-shrink-0">{option}</Button>
                ))}
                <Button size="icon" variant="ghost" onClick={() => setModalOptionPage(p => Math.min(Math.ceil(25 / 7) - 1, p + 1))} disabled={modalOptionPage >= Math.floor(24 / 7)}><ChevronRight /></Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isProfileViewOpen && (
        <MainUhubFeatureV001ForUserProfileModal isOpen={isProfileViewOpen} onClose={() => setProfileViewOpen(false)} user={viewedUser} />
      )}
    </>
  );
};

export default MainUhubFeatureV001ForChatModal;
