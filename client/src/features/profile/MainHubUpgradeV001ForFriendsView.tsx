
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageSquare } from 'lucide-react';

// Dummy data for friends list
const friends = [
  { id: 1, username: 'uMary', avatar: 'https://i.pravatar.cc/150?u=uMary', online: true },
  { id: 2, username: 'uJohn', avatar: 'https://i.pravatar.cc/150?u=uJohn', online: false },
  { id: 3, username: 'uPeter', avatar: 'https://i.pravatar.cc/150?u=uPeter', online: true },
];

// Dummy data for messages
const messages = [
    { id: 1, sender: 'uMary', content: 'Hey, how are you?', timestamp: '10:30 AM' },
    { id:2, sender: 'me', content: 'I am good, thanks! How about you?', timestamp: '10:31 AM' },
    { id: 3, sender: 'uMary', content: 'Doing great! Just working on the new broadcast.', timestamp: '10:32 AM' },
];

const MainHubUpgradeV001ForFriendsView = () => {
  const [selectedFriend, setSelectedFriend] = React.useState(friends[0]);

  return (
    <div className="grid grid-cols-3 h-full gap-4">
      {/* Friends List */}
      <div className="col-span-1 border-r pr-4 overflow-y-auto">
        <h4 className="font-bold text-lg mb-4">Friends List</h4>
        <div className="space-y-2">
          {friends.map(friend => (
            <div
              key={friend.id}
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedFriend.id === friend.id ? 'bg-accent' : 'hover:bg-muted/50'}`}
              onClick={() => setSelectedFriend(friend)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friend.avatar} />
                  <AvatarFallback>{friend.username.charAt(1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{friend.username}</p>
                  <p className={`text-xs ${friend.online ? 'text-green-500' : 'text-muted-foreground'}`}>
                    {friend.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Message Area */}
      <div className="col-span-2 flex flex-col h-full">
        {selectedFriend ? (
          <>
            <div className="border-b pb-2 mb-4">
              <h4 className="font-bold text-lg">Chat with {selectedFriend.username}</h4>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs text-right mt-1 opacity-70">{msg.timestamp}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input placeholder={`Message ${selectedFriend.username}...`} />
              <Button>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a friend to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainHubUpgradeV001ForFriendsView;
