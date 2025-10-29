
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import MainHubUpgradeV001ForChatModal from '../uminion/MainHubUpgradeV001ForChatModal';

interface MainHubUpgradeV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainHubUpgradeV001ForSocialLinks = {
  facebook: 'https://www.facebook.com/groups/1615679026489537',
  bluesky: 'https://bsky.app/profile/uminion.bsky.social',
  github: 'https://github.com/uminionunion/uminionswebsite',
  youtube: 'https://www.youtube.com/@UminionUnion',
  twitch: 'https://www.twitch.tv/theuminionunion',
  discord: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075',
  instagram: 'https://www.instagram.com/theuminionunion/?igsh=ajdjeGUycHRmczVs&ut-m_source=qr#',
  mastodon: 'https://mastodon.social/@uminion',
  threads: 'https://www.threads.com/@theuminionunion',
  patreon: 'https://www.patreon.com/uminion',
  githubDiscussions: 'https://github.com/uminionunion/UminionsWebsite/discussions',
  githubIssues: 'https://github.com/uminionunion/UminionsWebsite/issues',
};

const MainHubUpgradeV001ForSocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    {children}
  </a>
);

const MainHubUpgradeV001ForMyProfileModal: React.FC<MainHubUpgradeV001ForMyProfileModalProps> = ({ isOpen, onClose }) => {
  const MainHubUpgradeV001ForUHomeHubButtons = Array.from({ length: 24 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);

  const MainHubUpgradeV001ForSisterUnionPages = [
    'SisterUnion001NewEngland', 'SisterUnion002CentralEastCoast', 'SisterUnion003SouthEast',
    'SisterUnion004TheGreatLakesAndAppalachia', 'SisterUnion005CentralSouth', 'SisterUnion006CentralNorth',
    'SisterUnion007SouthWest', 'SisterUnion008NorthWest', 'SisterUnion009International',
    'SisterUnion010TheGreatHall', 'SisterUnion011WaterFall', 'SisterUnion012UnionEvent',
    'SisterUnion013UnionSupport', 'SisterUnion014UnionNews', 'SisterUnion015UnionRadio',
    'SisterUnion016UnionDrive', 'SisterUnion017UnionArchiveAndEducation', 'SisterUnion018UnionTech',
    'SisterUnion019UnionPolitic', 'SisterUnion020UnionSAM', 'SisterUnion021UnionUkraineAndTheCrystalPalace',
    'SisterUnion022FestyLove', 'SisterUnion023UnionLegal', 'SisterUnion024UnionMarket',
  ];
  const MainHubUpgradeV001ForModalColors = Array.from({ length: 24 }, (_, i) => `hsl(${i * 15}, 70%, 80%)`);

  const handleUHomeHubClick = (buttonNumber: number) => {
    setActiveChatModal(buttonNumber);
  };

  const handleCloseChatModal = () => {
    setActiveChatModal(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Top Section */}
            <div className="flex p-4 border-b">
              <div id="MainHubUpgradeV001ForMyProfileSettingsTopLeftSection" className="w-1/5 grid grid-cols-2 grid-rows-2 gap-2 pr-4">
                <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="FriendsFam&Others"><Users className="mb-1" /> Friends</Button>
                <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Broadcast"><Megaphone className="mb-1" /> Broadcast</Button>
                <a href="https://github.com/uminionunion/uminionswebsite" target="_blank" rel="noopener noreferrer" className="w-full h-full">
                  <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center" title="Code"><Code className="mb-1" /> Code</Button>
                </a>
                <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Settings"><Settings className="mb-1" /> Settings</Button>
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsTopMiddleSection" className="w-3/5 h-40 bg-cover bg-center rounded-md" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}>
                <Button className="absolute">Change Cover</Button>
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsTopRightSection" className="w-1/5 flex justify-end items-start pl-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="https://uminion.com/wp-content/uploads/2025/02/iArt06532.png" alt="Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Button size="sm" className="absolute">Edit</Button>
              </div>
            </div>

            {/* Center Section */}
            <div className="flex-grow flex overflow-hidden">
              <div id="MainHubUpgradeV001ForMyProfileSettingsCenterLeftSection" className="w-[20%] p-4 border-r overflow-y-auto">
                <h3 className="text-center font-bold mb-4">uHome-Hub:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {MainHubUpgradeV001ForUHomeHubButtons.map(num => (
                    <Button key={num} variant="outline" size="sm" onClick={() => handleUHomeHubClick(num)}>#{String(num).padStart(2, '0')}</Button>
                  ))}
                </div>
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsCenterCenterSection" className="w-[60%] p-4 overflow-y-auto">
                <div className="flex items-center justify-center mb-4">
                  <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                  <h3 className="text-center font-bold mx-4">Broadcasts- UnionNews#14</h3>
                  <Button variant="ghost" size="icon"><ChevronRight /></Button>
                </div>
                {/* Content for center section goes here */}
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsCenterRightSection" className="w-[20%] p-4 border-l overflow-y-auto">
                <div className="flex items-center justify-center mb-4">
                    <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                    <h3 className="text-center font-bold mx-4">UnionSAM#20</h3>
                    <Button variant="ghost" size="icon"><ChevronRight /></Button>
                </div>
                <div className="space-y-4">
                  <div id="MainHubUpgradeV001ForMainStore" className="border rounded-md p-2">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-center">Main Store</h4>
                        <a href="https://uminion.com/cart/" target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500" id="MainHubUpgradeV001ForUnionSAM#20ViewCart">
                                <ShoppingCart />
                            </Button>
                        </a>
                    </div>
                    <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg')" }}></div>
                  </div>
                  <div id="MainHubUpgradeV001ForYourStore" className="border rounded-md p-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 mr-2">
                                <Eye />
                            </Button>
                            <h4 className="font-semibold text-center">Your Store:</h4>
                        </div>
                        {/* Placeholder for earnings */}
                    </div>
                    <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png')" }}></div>
                  </div>
                  <div id="MainHubUpgradeV001ForUnionSAM20MyProfileExtras001" className="border rounded-md p-2">
                    <h4 className="font-semibold text-center">Extras 001</h4>
                    <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png')" }}></div>
                  </div>
                  <div id="MainHubUpgradeV001ForUnionSAM20MyProfileExtras002" className="border rounded-md p-2">
                    <h4 className="font-semibold text-center">Extras 002</h4>
                    <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png')" }}></div>
                  </div>
                  <div id="MainHubUpgradeV001ForUnionSAM20MyProfileExtras003" className="border rounded-md p-2">
                    <h4 className="font-semibold text-center">Extras 003</h4>
                    <div className="h-32 bg-cover bg-center mt-2" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png')" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex border-t">
              <div id="MainHubUpgradeV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-4 border-r grid grid-cols-3 gap-4 place-items-center">
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.facebook}><Facebook /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.bluesky}><MessageSquare /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.github}><Github /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.youtube}><Youtube /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.twitch}><Twitch /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.discord}>D</MainHubUpgradeV001ForSocialIcon>
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsBottomCenterSection" className="w-[60%] p-4 flex items-center justify-center">
                <a href="https://uminion.com/product/union-card-the-official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                  Become an Official Member of the Union via getting your Union Card Today!
                </a>
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-4 border-l grid grid-cols-3 gap-4 place-items-center">
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.instagram}><Instagram /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.mastodon}>M</MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.githubDiscussions}><Github /></MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.threads}>@</MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.patreon}>P</MainHubUpgradeV001ForSocialIcon>
                <MainHubUpgradeV001ForSocialIcon href={MainHubUpgradeV001ForSocialLinks.githubIssues}><Github /></MainHubUpgradeV001ForSocialIcon>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {activeChatModal !== null && (
        <MainHubUpgradeV001ForChatModal
          isOpen={activeChatModal !== null}
          onClose={handleCloseChatModal}
          pageName={MainHubUpgradeV001ForSisterUnionPages[activeChatModal - 1]}
          backgroundColor={MainHubUpgradeV001ForModalColors[activeChatModal - 1]}
          modalNumber={activeChatModal}
        />
      )}
    </>
  );
};

export default MainHubUpgradeV001ForMyProfileModal;
