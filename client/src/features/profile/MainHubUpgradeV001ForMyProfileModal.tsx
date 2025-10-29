
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search } from 'lucide-react';
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

const ProductBox = ({ product }) => {
    const [inCart, setInCart] = useState(false);

    const handleCartClick = () => {
        setInCart(!inCart);
        // Here you would typically call an API to update the cart
    };

    if (!product) return <div className="h-48 border rounded-md p-2 flex items-center justify-center text-muted-foreground">No Product</div>;

    return (
        <div className="border rounded-md p-2 relative h-48">
            <div className="absolute top-1 left-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded">{product.name}</div>
            <div className="absolute top-1 right-1">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Search className="h-4 w-4" />
                </Button>
            </div>
            <div className="h-full bg-cover bg-center" style={{ backgroundImage: `url('${product.image_url}')` }}></div>
            <div className="absolute bottom-1 left-1">
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleCartClick}>
                    {inCart ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <ShoppingCart className="h-4 w-4" />
                </Button>
            </div>
            {product.price && (
                <div className="absolute bottom-1 right-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded">${product.price.toFixed(2)}</div>
            )}
        </div>
    );
};


const MainHubUpgradeV001ForMyProfileModal: React.FC<MainHubUpgradeV001ForMyProfileModalProps> = ({ isOpen, onClose }) => {
  const MainHubUpgradeV001ForUHomeHubButtons = Array.from({ length: 24 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [products, setProducts] = useState([]);
  const [centerRightView, setCenterRightView] = useState('UnionSAM#20');
  const centerRightViews = ['UnionEvent#12', 'UnionPolitic#19', 'UnionSAM#20'];

  useEffect(() => {
    // This would fetch products from an API
    const fetchProducts = async () => {
        // Dummy data until API is ready
        const dummyProducts = [
            { id: 1, name: 'Tapestry', price: 49.99, image_url: 'https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg' },
            { id: 2, name: 'T-Shirt', price: 24.99, image_url: 'https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png' },
            { id: 3, name: 'Classic Logo', price: 19.99, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png' },
            { id: 4, name: 'Ukraine Logo', price: 15.00, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png' },
            { id: 5, name: 'Union Card', price: 9.99, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png' },
        ];
        setProducts(dummyProducts);
    };
    fetchProducts();
  }, []);

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

  const navigateCenterRight = (direction: 'left' | 'right') => {
    const currentIndex = centerRightViews.indexOf(centerRightView);
    let nextIndex;
    if (direction === 'right') {
        nextIndex = (currentIndex + 1) % centerRightViews.length;
    } else {
        nextIndex = (currentIndex - 1 + centerRightViews.length) % centerRightViews.length;
    }
    setCenterRightView(centerRightViews[nextIndex]);
  };

  const renderCenterRightContent = () => {
    switch (centerRightView) {
        case 'UnionSAM#20':
            return (
                <div className="space-y-2">
                    <ProductBox product={products[0]} />
                    <ProductBox product={products[1]} />
                    <ProductBox product={products[2]} />
                    <ProductBox product={products[3]} />
                    <ProductBox product={products[4]} />
                </div>
            );
        case 'UnionPolitic#19':
            return (
                <div className="space-y-2">
                    <ProductBox product={products[0]} />
                    <ProductBox product={products[1]} />
                    <ProductBox product={products[2]} />
                </div>
            );
        case 'UnionEvent#12':
            return (
                <div className="space-y-2">
                    <ProductBox product={products[0]} />
                </div>
            );
        default:
            return null;
    }
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
                    <Button variant="ghost" size="icon" onClick={() => navigateCenterRight('left')}><ChevronLeft /></Button>
                    <h3 className="text-center font-bold mx-4">{centerRightView}</h3>
                    <Button variant="ghost" size="icon" onClick={() => navigateCenterRight('right')}><ChevronRight /></Button>
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
                  </div>
                  {renderCenterRightContent()}
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
