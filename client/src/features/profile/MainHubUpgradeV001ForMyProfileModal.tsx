
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play } from 'lucide-react';
import MainHubUpgradeV001ForChatModal from '../uminion/MainHubUpgradeV001ForChatModal';
import { useAuth } from '@/hooks/useAuth';
import MainHubUpgradeV001ForAddProductModal from './MainHubUpgradeV001ForAddProductModal';
import MainHubUpgradeV001ForProductDetailModal from './MainHubUpgradeV001ForProductDetailModal';
import MainHubUpgradeV001ForFriendsView from './MainHubUpgradeV001ForFriendsView';
import MainHubUpgradeV001ForSettingsView from './MainHubUpgradeV001ForSettingsView';
import { CreateBroadcastView } from './CreateBroadcastView';

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

const ProductBox = ({ product, onMagnify }) => {
    const [inCart, setInCart] = useState(false);

    const handleCartClick = () => {
        setInCart(!inCart);
    };

    if (!product) return <div className="h-48 border rounded-md p-2 flex items-center justify-center text-muted-foreground">No Product</div>;

    const handleImageClick = () => {
        if (product.url) {
            window.open(product.url, '_blank');
        }
    };

    return (
        <div className="border rounded-md p-2 relative h-48 group">
            <div className="absolute top-1 left-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded z-10">{product.name}</div>
            <div className="absolute top-1 right-1 z-10">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMagnify(product)}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>
            <div className="h-full bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url('${product.image_url}')` }} onClick={handleImageClick}></div>
            <div className="absolute bottom-1 left-1 z-10">
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleCartClick}>
                    {inCart ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <ShoppingCart className="h-4 w-4" />
                </Button>
            </div>
            {product.price && (
                <div className="absolute bottom-1 right-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded z-10">${product.price.toFixed(2)}</div>
            )}
        </div>
    );
};

const BroadcastView = ({ broadcast }) => (
    <div className="flex gap-6">
        <div className="w-1/3">
            <div className="aspect-square bg-muted rounded-md mb-2 bg-cover bg-center" style={{backgroundImage: `url(${broadcast.logo})`}}></div>
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
                <Button variant="ghost" size="icon"><ChevronRight /></Button>
            </div>
        </div>
        <div className="w-2/3">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="icon"><Play /></Button>
                <h4 className="font-semibold">{broadcast.subtitle}</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {broadcast.extraImages.slice(0,3).map((img, i) => <div key={i} className="aspect-square bg-muted rounded-md bg-cover bg-center" style={{backgroundImage: `url(${img})`}}></div>)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">{broadcast.description}</p>
            <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">Visit Website</a>
        </div>
    </div>
);


const MainHubUpgradeV001ForMyProfileModal: React.FC<MainHubUpgradeV001ForMyProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const MainHubUpgradeV001ForUHomeHubButtons = Array.from({ length: 24 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [products, setProducts] = useState([]);
  const [centerRightView, setCenterRightView] = useState('UnionSAM#20');
  const centerRightViews = ['UnionEvent#12', 'UnionPolitic#19', 'UnionSAM#20'];
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [centerView, setCenterView] = useState('broadcasts'); // 'broadcasts', 'friends', 'settings'
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);

  const [broadcastView, setBroadcastView] = useState('UnionNews#14');
  const broadcasts = {
      'UnionNews#14': { title: 'Broadcasts- UnionNews#14', creator: 'uAdmin', subtitle: 'The latest news from the Union.', logo: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', extraImages: ['https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg', 'https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png', 'https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png'], description: 'This week, we cover the latest developments in Union infrastructure and upcoming community events. Stay tuned for special announcements!', website: 'https://uminion.com' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'uDJ', subtitle: '24/7 tunes for the Union.', logo: 'https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png', extraImages: [], description: 'Non-stop music curated for our members. Send in your requests!', website: 'https://uminion.com' },
  };
  const broadcastKeys = ['MyBroadcasts', ...Object.keys(broadcasts)];

  useEffect(() => {
    if (user && isOpen) {
      fetch('/api/friends/requests/pending')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPendingFriendRequests(data);
          }
        });
    }
  }, [user, isOpen]);

  useEffect(() => {
    const fetchProducts = async () => {
        const dummyProducts = [
            { id: 1, name: 'Tapestry', price: 1999.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg', url: 'https://uminion.com/product/byoct-build-your-own-custom-tapestry/' },
            { id: 2, name: 'T-Shirt', price: 24.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png', url: 'https://uminion.com/product/custom-u-t-shirt/' },
            { id: 3, name: 'Classic Logo', price: 64.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-18-2024-poster/' },
            { id: 4, name: 'Ukraine Logo', price: 24.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png', url: 'https://u24.gov.ua/' },
            { id: 5, name: 'Union Card', price: 14.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png', url: 'https://uminion.com/product/union-card-the-official-uminion-union-card/' },
        ];
        setProducts(dummyProducts);
    };
    fetchProducts();
  }, []);

  const handleMagnify = (product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

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
  const MainHubUpgradeV001ForModalColors = Array.from({ length: 24 }, (_, i) => `hsl(${i * 15}, 70%, 50%)`);

  const handleUHomeHubClick = (buttonNumber: number) => setActiveChatModal(buttonNumber);
  const handleCloseChatModal = () => setActiveChatModal(null);

  const navigateCenterRight = (direction: 'left' | 'right') => {
    const currentIndex = centerRightViews.indexOf(centerRightView);
    const nextIndex = (currentIndex + (direction === 'right' ? 1 : -1) + centerRightViews.length) % centerRightViews.length;
    setCenterRightView(centerRightViews[nextIndex]);
  };

  const navigateBroadcast = (direction: 'left' | 'right') => {
    const currentIndex = broadcastKeys.indexOf(broadcastView);
    const nextIndex = (currentIndex + (direction === 'right' ? 1 : -1) + broadcastKeys.length) % broadcastKeys.length;
    setBroadcastView(broadcastKeys[nextIndex]);
  };

  const renderCenterRightContent = () => {
    const productSlices = {
        'UnionSAM#20': products.slice(0, 5),
        'UnionPolitic#19': products.slice(0, 3),
        'UnionEvent#12': products.slice(0, 1),
    };
    const currentProducts = productSlices[centerRightView] || [];
    return (
        <div className="space-y-2">
            {currentProducts.length > 0 && <ProductBox product={currentProducts[0]} onMagnify={handleMagnify} />}
            <div id="MainHubUpgradeV001ForYourStore" className="border rounded-md p-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 mr-2" onClick={() => {
                            if (!user) {
                                alert('You must be logged in to add a product.');
                                return;
                            }
                            setAddProductModalOpen(true)
                        }}>
                            <Eye />
                        </Button>
                        <h4 className="font-semibold text-center">Your Store:</h4>
                    </div>
                    {/* Placeholder for earnings */}
                </div>
            </div>
            {currentProducts.slice(1).map((p, i) => <ProductBox key={i} product={p} onMagnify={handleMagnify} />)}
        </div>
    );
  };

  const renderCenterContent = () => {
    switch (centerView) {
        case 'friends':
            return <MainHubUpgradeV001ForFriendsView pendingRequests={pendingFriendRequests} setPendingRequests={setPendingFriendRequests} />;
        case 'settings':
            return <MainHubUpgradeV001ForSettingsView />;
        case 'broadcasts':
        default:
            return (
                <>
                    <div className="flex items-center justify-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigateBroadcast('left')}>
                            <ChevronLeft />
                        </Button>
                        <h3 className="text-center font-bold mx-4">{broadcasts[broadcastView]?.title || 'MyBroadcasts'}</h3>
                        <Button variant="ghost" size="icon" onClick={() => navigateBroadcast('right')}>
                            <ChevronRight />
                        </Button>
                    </div>
                    {broadcastView === 'MyBroadcasts' ? <CreateBroadcastView /> : <BroadcastView broadcast={broadcasts[broadcastView]} />}
                </>
            );
    }
  };

  const handleTopLeftButtonClick = (view: string) => {
    if (!user) {
      alert("You must be logged in to use this feature.");
      return;
    }
    setCenterView(view);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full w-full h-full p-0 m-0 flex flex-col">
          <div className="flex-grow flex flex-col overflow-hidden">
            {/* Top Section */}
            <div className="flex p-4 border-b">
              <div id="MainHubUpgradeV001ForMyProfileSettingsTopLeftSection" className="w-1/5 grid grid-cols-2 grid-rows-2 gap-2 pr-4">
                <Button variant="outline" className="flex flex-col h-full items-center justify-center relative" title="FriendsFam&Others" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
                  {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
                  <Users className="mb-1" /> Friends
                </Button>
                <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="mb-1" /> Broadcast</Button>
                <a href="https://github.com/uminionunion/uminionswebsite" target="_blank" rel="noopener noreferrer" className="w-full h-full">
                  <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center" title="Code" disabled={!user}><Code className="mb-1" /> Code</Button>
                </a>
                <Button variant="outline" className="flex flex-col h-full items-center justify-center" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="mb-1" /> Settings</Button>
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsTopMiddleSection" className="w-3/5 h-40 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}>
                {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
              </div>
              <div id="MainHubUpgradeV001ForMyProfileSettingsTopRightSection" className="w-1/5 flex justify-end items-start pl-4 relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="https://uminion.com/wp-content/uploads/2025/02/iArt06532.png" alt="Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {user && <Button size="sm" className="absolute top-0 right-0">Edit</Button>}
                <div className="absolute bottom-0 right-0 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-muted-foreground">{user ? 'Online' : 'Not Logged In'}</span>
                </div>
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
                {renderCenterContent()}
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
      {isAddProductModalOpen && (
        <MainHubUpgradeV001ForAddProductModal isOpen={isAddProductModalOpen} onClose={() => setAddProductModalOpen(false)} />
      )}
      {isProductDetailModalOpen && (
        <MainHubUpgradeV001ForProductDetailModal isOpen={isProductDetailModalOpen} onClose={() => setProductDetailModalOpen(false)} product={selectedProduct} />
      )}
    </>
  );
};

export default MainHubUpgradeV001ForMyProfileModal;
