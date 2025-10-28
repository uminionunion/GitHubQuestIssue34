
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare } from 'lucide-react';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const socialLinks = {
  facebook: 'https://www.facebook.com/groups/1615679026489537',
  bluesky: 'https://bsky.app/profile/uminion.bsky.social',
  github: 'https://github.com/uminionunion/uminionswebsite',
  youtube: 'https://www.youtube.com/@UminionUnion',
  twitch: 'https://www.twitch.tv/theuminionunion',
  discord: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075',
  instagram: '#',
  mastodon: '#',
  threads: '#',
  patreon: '#',
};

const SocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    {children}
  </a>
);

const MyProfileModal: React.FC<MyProfileModalProps> = ({ isOpen, onClose }) => {
  const uHomeHubButtons = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Top Section */}
          <div className="flex p-4 border-b">
            <div id="MyProfileSettingsTopLeftSection" className="w-1/5 grid grid-cols-2 grid-rows-2 gap-2 pr-4">
              <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="FriendsFam&Others"><Users className="mb-1" /> Friends</Button>
              <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Broadcast"><Megaphone className="mb-1" /> Broadcast</Button>
              <a href="https://github.com/uminionunion/uminionswebsite" target="_blank" rel="noopener noreferrer" className="w-full h-full">
                <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center" title="Code"><Code className="mb-1" /> Code</Button>
              </a>
              <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Settings"><Settings className="mb-1" /> Settings</Button>
            </div>
            <div id="MyProfileSettingsTopMiddleSection" className="w-3/5 h-40 bg-cover bg-center rounded-md" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}>
              <Button className="absolute">Change Cover</Button>
            </div>
            <div id="MyProfileSettingsTopRightSection" className="w-1/5 flex justify-end items-start pl-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src="https://uminion.com/wp-content/uploads/2025/02/iArt06532.png" alt="Profile" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute">Edit</Button>
            </div>
          </div>

          {/* Center Section */}
          <div className="flex-grow flex overflow-hidden">
            <div id="MyProfileSettingsCenterLeftSection" className="w-[20%] p-4 border-r overflow-y-auto">
              <h3 className="text-center font-bold mb-4">uHome-Hub:</h3>
              <div className="grid grid-cols-2 gap-2">
                {uHomeHubButtons.map(num => (
                  <Button key={num} variant="outline" size="sm">#{String(num).padStart(2, '0')}</Button>
                ))}
              </div>
            </div>
            <div id="MyProfileSettingsCenterCenterSection" className="w-[60%] p-4 overflow-y-auto">
              <h3 className="text-center font-bold mb-4">UnionNews#14</h3>
              {/* Content for center section goes here */}
            </div>
            <div id="MyProfileSettingsCenterRightSection" className="w-[20%] p-4 border-l overflow-y-auto">
              <h3 className="text-center font-bold mb-4">UnionSAM#20</h3>
              <div className="space-y-4">
                <div id="MainStore" className="border rounded-md p-2">
                  <h4 className="font-semibold text-center">Main Store</h4>
                  <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg')" }}></div>
                </div>
                <div id="YourStore" className="border rounded-md p-2">
                  <h4 className="font-semibold text-center">Your Store:</h4>
                  <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png')" }}></div>
                </div>
                <div id="UnionSAM20MyProfileExtras001" className="border rounded-md p-2">
                  <h4 className="font-semibold text-center">Extras 001</h4>
                  <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png')" }}></div>
                </div>
                <div id="UnionSAM20MyProfileExtras002" className="border rounded-md p-2">
                  <h4 className="font-semibold text-center">Extras 002</h4>
                  <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png')" }}></div>
                </div>
                <div id="UnionSAM20MyProfileExtras003" className="border rounded-md p-2">
                  <h4 className="font-semibold text-center">Extras 003</h4>
                  <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png')" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex border-t">
            <div id="MyProfileSettingsBottomLeftSection" className="w-[20%] p-4 border-r grid grid-cols-3 gap-4 place-items-center">
              <SocialIcon href={socialLinks.facebook}><Facebook /></SocialIcon>
              <SocialIcon href={socialLinks.bluesky}><MessageSquare /></SocialIcon>
              <SocialIcon href={socialLinks.github}><Github /></SocialIcon>
              <SocialIcon href={socialLinks.youtube}><Youtube /></SocialIcon>
              <SocialIcon href={socialLinks.twitch}><Twitch /></SocialIcon>
              <SocialIcon href={socialLinks.discord}>D</SocialIcon>
            </div>
            <div id="MyProfileSettingsBottomCenterSection" className="w-[60%] p-4 flex items-center justify-center">
              <a href="https://uminion.com/product/union-card-the-official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                Become an Official Member of the Union via getting your Union Card Today!
              </a>
            </div>
            <div id="MyProfileSettingsBottomRightSection" className="w-[20%] p-4 border-l grid grid-cols-3 gap-4 place-items-center">
              <SocialIcon href={socialLinks.instagram}><Instagram /></SocialIcon>
              <SocialIcon href={socialLinks.mastodon}>M</SocialIcon>
              <SocialIcon href={socialLinks.github}><Github /></SocialIcon>
              <SocialIcon href={socialLinks.threads}>@</SocialIcon>
              <SocialIcon href={socialLinks.patreon}>P</SocialIcon>
              <SocialIcon href={socialLinks.github}><Github /></SocialIcon>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MyProfileModal;
