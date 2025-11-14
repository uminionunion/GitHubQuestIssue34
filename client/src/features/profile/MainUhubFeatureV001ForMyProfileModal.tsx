
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X } from 'lucide-react';
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { useAuth } from '@/hooks/useAuth';
import MainUhubFeatureV001ForAddProductModal from './MainUhubFeatureV001ForAddProductModal';
import MainUhubFeatureV001ForProductDetailModal from './MainUhubFeatureV001ForProductDetailModal';
import MainUhubFeatureV001ForFriendsView from './MainUhubFeatureV001ForFriendsView';
import MainUhubFeatureV001ForSettingsView from './MainUhubFeatureV001ForSettingsView';
import { CreateBroadcastView } from './CreateBroadcastView';

interface MainUhubFeatureV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
}

const socialLinksLeftPage1 = [
  { id: 'facebook', href: 'https://www.facebook.com/groups/1615679026489537', icon: <Facebook /> },
  { id: 'bluesky', href: 'https://bsky.app/profile/uminion.bsky.social', icon: <MessageSquare /> },
  { id: 'github', href: 'https://github.com/uminionunion/uminionswebsite', icon: <Github /> },
  { id: 'youtube', href: 'https://www.youtube.com/@UminionUnion', icon: <Youtube /> },
  { id: 'twitch', href: 'https://www.twitch.tv/theuminionunion', icon: <Twitch /> },
  { id: 'discord', href: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075', icon: 'D' },
];
const socialLinksLeftPage2 = [
    { id: 'page2-1', href: 'https://example.com/page2-1', icon: 'L1' },
    { id: 'page2-2', href: 'https://example.com/page2-2', icon: 'L2' },
    { id: 'page2-3', href: 'https://example.com/page2-3', icon: 'L3' },
    { id: 'page2-4', href: 'https://example.com/page2-4', icon: 'L4' },
    { id: 'page2-5', href: 'https://example.com/page2-5', icon: 'L5' },
    { id: 'page2-6', href: 'https://example.com/page2-6', icon: 'L6' },
];
const socialLinksLeftPage3 = [
    { id: 'page3-1', href: 'https://example.com/page3-1', icon: 'L7' },
    { id: 'page3-2', href: 'https://example.com/page3-2', icon: 'L8' },
    { id: 'page3-3', href: 'https://example.com/page3-3', icon: 'L9' },
    { id: 'page3-4', href: 'https://example.com/page3-4', icon: 'L10' },
    { id: 'page3-5', href: 'https://example.com/page3-5', icon: 'L11' },
    { id: 'page3-6', href: 'https://example.com/page3-6', icon: 'L12' },
];
const socialLinkPagesLeft = [socialLinksLeftPage1, socialLinksLeftPage2, socialLinksLeftPage3];

const socialLinksRightPage1 = [
  { id: 'instagram', href: 'https://www.instagram.com/theuminionunion/?igsh=ajdjeGUycHRmczVs&ut-m_source=qr#', icon: <Instagram /> },
  { id: 'mastodon', href: 'https://mastodon.social/@uminion', icon: 'M' },
  { id: 'githubDiscussions', href: 'https://github.com/uminionunion/UminionsWebsite/discussions', icon: <Github /> },
  { id: 'threads', href: 'https://www.threads.com/@theuminionunion', icon: '@' },
  { id: 'patreon', href: 'https://www.patreon.com/uminion', icon: 'P' },
  { id: 'githubIssues', href: 'https://github.com/uminionunion/UminionsWebsite/issues', icon: <Github /> },
];
const socialLinksRightPage2 = [
    { id: 'page2-r1', href: 'https://example.com/page2-r1', icon: 'R1' },
    { id: 'page2-r2', href: 'https://example.com/page2-r2', icon: 'R2' },
    { id: 'page2-r3', href: 'https://example.com/page2-r3', icon: 'R3' },
    { id: 'page2-r4', href: 'https://example.com/page2-r4', icon: 'R4' },
    { id: 'page2-r5', href: 'https://example.com/page2-r5', icon: 'R5' },
    { id: 'page2-r6', href: 'https://example.com/page2-r6', icon: 'R6' },
];
const socialLinksRightPage3 = [
    { id: 'page3-r1', href: 'https://example.com/page3-r1', icon: 'R7' },
    { id: 'page3-r2', href: 'https://example.com/page3-r2', icon: 'R8' },
    { id: 'page3-r3', href: 'https://example.com/page3-r3', icon: 'R9' },
    { id: 'page3-r4', href: 'https://example.com/page3-r4', icon: 'R10' },
    { id: 'page3-r5', href: 'https://example.com/page3-r5', icon: 'R11' },
    { id: 'page3-r6', href: 'https://example.com/page3-r6', icon: 'R12' },
];
const socialLinkPagesRight = [socialLinksRightPage1, socialLinksRightPage2, socialLinksRightPage3];

const MainUhubFeatureV001ForSocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    {children}
  </a>
);

const ProductBox = ({ product, onMagnify }) => {
    const [inCart, setInCart] = useState(false);

    const handleCartClick = () => {
        setInCart(!inCart);
    };

    if (!product) return <div className="h-36 md:h-48 border rounded-md p-2 flex items-center justify-center text-muted-foreground">No Product</div>;

    const handleImageClick = () => {
        if (product.url) {
            window.open(product.url, '_blank');
        }
    };

    return (
        <div className="border rounded-md p-2 relative h-36 md:h-48 group">
            <div className="absolute top-1 left-1 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded z-10">{product.name}</div>
            <div className="absolute top-1 right-1 z-10">
                {product.time ? (
                    <span className="text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded">{product.time}</span>
                ) : (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onMagnify(product)}>
                        <Search className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="h-full bg-cover bg-center cursor-pointer" style={{ backgroundImage: `url('${product.image_url}')` }} onClick={handleImageClick}></div>
            <div className="absolute bottom-1 left-1 z-10 text-xs font-bold bg-black bg-opacity-50 text-white px-1 rounded">
                {product.location ? (
                    <span>{product.location}</span>
                ) : (
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleCartClick}>
                        {inCart ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                )}
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
            <h4 className="font-semibold">{broadcast.subtitle}</h4>
            <div className="aspect-square bg-muted rounded-md my-2 bg-cover bg-center" style={{backgroundImage: `url(${broadcast.logo})`}}></div>
            <div className="flex justify-between items-center">
                <Button variant="ghost" size="icon"><ChevronLeft /></Button>
                <span className="text-xs text-muted-foreground">by {broadcast.creator}</span>
                <Button variant="ghost" size="icon"><ChevronRight /></Button>
            </div>
        </div>
        <div className="w-2/3">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="icon"><Play /></Button>
                <p className="text-sm text-muted-foreground flex-grow">{broadcast.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {broadcast.extraImages.slice(0,3).map((img, i) => <div key={i} className="aspect-square bg-muted rounded-md bg-cover bg-center" style={{backgroundImage: `url(${img})`}}></div>)}</div>
            <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">Visit Website</a>
        </div>
    </div>
);

const MainUhubFeatureV001ForMyProfileModal: React.FC<MainUhubFeatureV001ForMyProfileModalProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  const { user } = useAuth();
  const MainUhubFeatureV001ForUHomeHubButtons = Array.from({ length: 24 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [products, setProducts] = useState<any>({});
  const [centerRightView, setCenterRightView] = useState('UnionSAM#20');
  const centerRightViews = ['UnionEvent#12', 'UnionPolitic#19', 'UnionSAM#20'];
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [centerView, setCenterView] = useState('broadcasts');
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [socialPageLeft, setSocialPageLeft] = useState(0);
  const [socialPageRight, setSocialPageRight] = useState(0);

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
    const allProducts = {
        'UnionSAM#20': [
            { id: 1, name: 'Tapestry', price: 1999.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/TapestryVersion001.jpg', url: 'https://uminion.com/product/byoct-build-your-own-custom-tapestry/', store: 'main' },
            { id: 2, name: 'uT-Shirt', price: 24.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/Tshirtbatchversion001.png', url: 'https://uminion.com/product/custom-u-t-shirt/', store: 'user' },
            { id: 3, name: 'Classic Logo', price: 64.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-18-2024-poster/', store: 'user' },
            { id: 4, name: 'Ukraine', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UkraineLogo001-1536x1536.png', url: 'https://u24.gov.ua/', store: 'user' },
            { id: 5, name: 'Official Union Card', price: 14.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionCardVersion001.png', url: 'https://uminion.com/product/union-card-the-official-uminion-union-card/', store: 'user' },
        ],
        'UnionPolitic#19': [
            { id: 6, name: 'Support unionCandidates as a WHOLE', price: 64.95, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
            { id: 7, name: 'unionCandidateX', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
            { id: 8, name: 'unionCandidateY', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
            { id: 9, name: 'unionCandidateZ', price: 5.25, image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo019.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-19-2024-poster/' },
        ],
        'UnionEvent#12': [
            { id: 10, name: 'Monthly Rally: This 24th!', time: '9am-9pm', location: 'Where: Downtown &/or: Outside your Local City Hall/State House!', image_url: 'https://uminion.com/wp-content/uploads/2025/03/UminionLogo012.00.2024Classic.png', url: 'https://uminion.com/product/sister-union-12-2024-poster/' },
        ],
    };
    setProducts(allProducts);
  }, []);

  const handleMagnify = (product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

  const MainUhubFeatureV001ForSisterUnionPages = [
    'SisterUnion001NewEngland', 'SisterUnion002CentralEastCoast', 'SisterUnion003SouthEast',
    'SisterUnion004TheGreatLakesAndAppalachia', 'SisterUnion005CentralSouth', 'SisterUnion006CentralNorth',
    'SisterUnion007SouthWest', 'SisterUnion008NorthWest', 'SisterUnion009International',
    'SisterUnion010TheGreatHall', 'SisterUnion011WaterFall', 'SisterUnion012UnionEvent',
    'SisterUnion013UnionSupport', 'SisterUnion014UnionNews', 'SisterUnion015UnionRadio',
    'SisterUnion016UnionDrive', 'SisterUnion017UnionArchiveAndEducation', 'SisterUnion018UnionTech',
    'SisterUnion019UnionPolitic', 'SisterUnion020UnionSAM', 'SisterUnion021UnionUkraineAndTheCrystalPalace',
    'SisterUnion022FestyLove', 'SisterUnion023UnionLegal', 'SisterUnion024UnionMarket',
  ];
  const MainUhubFeatureV001ForModalColors = Array.from({ length: 24 }, (_, i) => `hsl(${i * 15}, 70%, 50%)`);

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
    const currentProducts = products[centerRightView] || [];
    const mainStoreProducts = currentProducts.filter(p => p.store === 'main');
    const userStoreProducts = currentProducts.filter(p => p.store !== 'main');

    return (
        <>
            <div id="MainUhubFeatureV001ForMainStore" className="border rounded-md p-2">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-center">Main Store</h4>
                    <a href="https://uminion.com/cart/" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500" id="MainUhubFeatureV001ForUnionSAM#20ViewCart">
                            <ShoppingCart />
                        </Button>
                    </a>
                </div>
                <div className="space-y-2">
                    {mainStoreProducts.map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} />)}
                </div>
            </div>
            <div id="MainUhubFeatureV001ForYourStore" className="border rounded-md p-2">
                <div className="flex justify-between items-center mb-2">
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
                </div>
                <div className="space-y-2">
                    {userStoreProducts.map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} />)}
                </div>
            </div>
        </>
    );
  };

  const renderCenterContent = () => {
    switch (centerView) {
        case 'friends':
            return <MainUhubFeatureV001ForFriendsView pendingRequests={pendingFriendRequests} setPendingRequests={setPendingFriendRequests} />;
        case 'settings':
            return <MainUhubFeatureV001ForSettingsView />;
        case 'broadcasts':
        default:
            const currentBroadcast = broadcasts[broadcastView];
            return (
                <>
                    <div className="flex items-center justify-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => navigateBroadcast('left')}>
                            <ChevronLeft />
                        </Button>
                        <h3 className="text-center font-bold mx-4">{currentBroadcast?.title || 'MyBroadcasts'}</h3>
                        <Button variant="ghost" size="icon" onClick={() => navigateBroadcast('right')}>
                            <ChevronRight />
                        </Button>
                    </div>
                    {broadcastView === 'MyBroadcasts' ? 
                        (user ? <CreateBroadcastView /> : <p className="text-center text-muted-foreground">You must be logged in to create a broadcast.</p>) 
                        : (currentBroadcast ? <BroadcastView broadcast={currentBroadcast} /> : <p>Broadcast not found.</p>)}
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

  const handleProfileImageClick = () => {
    if (!user) {
      onClose();
      onOpenAuthModal('login');
    }
  };

  const handleSocialNavLeft = (dir: 'left' | 'right') => {
    setSocialPageLeft(prev => {
      const newPage = prev + (dir === 'right' ? 1 : -1);
      if (newPage < 0) return socialLinkPagesLeft.length - 1;
      if (newPage >= socialLinkPagesLeft.length) return 0;
      return newPage;
    });
  };
  
  const handleSocialNavRight = (dir: 'left' | 'right') => {
    setSocialPageRight(prev => {
      const newPage = prev + (dir === 'right' ? 1 : -1);
      if (newPage < 0) return socialLinkPagesRight.length - 1;
      if (newPage >= socialLinkPagesRight.length) return 0;
      return newPage;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="bg-background text-foreground w-full h-full flex flex-col relative">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-50" onClick={onClose}>
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>
         {/* Top Section */}
         <div className="md:flex md:flex-row hidden md:p-4 md:border-b md:gap-0">
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopLeftSection" className="md:w-1/5 grid grid-cols-4 md:grid-cols-2 grid-rows-1 md:grid-rows-2 gap-2 md:pr-4">
             <Button variant="outline" className="flex flex-col h-full items-center justify-center relative text-xs" title="FriendsFam&Others" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
               {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
               <Users className="h-4 w-4 mb-1" /> Friends
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="h-4 w-4 mb-1" /> Broadcast</Button>
             <a href="https://github.com/uminionunion/uminionswebsite" target="_blank" rel="noopener noreferrer" className="w-full h-full">
               <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center text-xs" title="Code" disabled={!user}><Code className="h-4 w-4 mb-1" /> Code</Button>
             </a>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="h-4 w-4 mb-1" /> Settings</Button>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-3/5 h-32 md:h-40 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}>
             {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopRightSection" className="md:w-1/5 flex justify-center md:justify-end items-start md:pl-4 relative">
             <div onClick={handleProfileImageClick} className="cursor-pointer">
               <Avatar className="h-24 w-24 md:h-32 md:w-32">
                 <AvatarImage src={user?.profile_image_url || "https://uminion.com/wp-content/uploads/2025/02/iArt06532.png"} alt="Profile" />
                 <AvatarFallback>U</AvatarFallback>
               </Avatar>
             </div>
             {user && <Button size="sm" className="absolute top-0 right-0">Edit</Button>}
             <div className="absolute bottom-0 right-0 flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                 <span className="text-xs text-muted-foreground">{user ? 'Online' : 'Not Logged In'}</span>
             </div>
           </div>
         </div>

          {/* Mobile Top Row */}
          <div className="md:hidden flex flex-col p-2 border-b gap-2">
            <div className="flex gap-2 items-center">
              <div onClick={handleProfileImageClick} className="cursor-pointer flex-shrink-0">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user?.profile_image_url || "https://uminion.com/wp-content/uploads/2025/02/iArt06532.png"} alt="Profile" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex gap-1 flex-1">
                <Button variant="outline" className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1" title="FriendsFam&Others" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
                  {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>}
                  <Users className="h-3 w-3" /><span className="text-xxs">Friends</span>
                </Button>
                <Button variant="outline" className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1" title="Broadcast" onClick={() => setCenterView('broadcasts')}>
                  <Megaphone className="h-3 w-3" /><span className="text-xxs">Broadcast</span>
                </Button>
                <a href="https://github.com/uminionunion/uminionswebsite" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full h-10 flex flex-col items-center justify-center text-xs p-1" title="Code" disabled={!user}>
                    <Code className="h-3 w-3" /><span className="text-xxs">Code</span>
                  </Button>
                </a>
                <Button variant="outline" className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}>
                  <Settings className="h-3 w-3" /><span className="text-xxs">Settings</span>
                </Button>
              </div>
            </div>
            <div className="h-24 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://uminion.com/wp-content/uploads/2025/03/UminionLogo018.00.2024Classic-1536x1536.png')" }}>
              {user && <Button className="absolute bottom-1 right-1 text-xs h-6" size="sm">Change</Button>}
            </div>
          </div>

         {/* Center Section */}
         <div className="flex-grow flex overflow-hidden">
           <div id="MainUhubFeatureV001ForMyProfileSettingsCenterLeftSection" className="md:w-[20%] w-[20%] p-2 md:p-4 border-r overflow-y-auto">
             <h3 className="text-center font-bold mb-2 md:mb-4 text-xs md:text-base">uHome-Hub:</h3>
             <div className="grid grid-cols-2 gap-1 md:gap-2">
               {MainUhubFeatureV001ForUHomeHubButtons.map(num => (
                 <Button key={num} variant="outline" size="sm" className="md:h-auto h-6 text-xs" onClick={() => handleUHomeHubClick(num)}>#{String(num).padStart(2, '0')}</Button>
               ))}
             </div>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsCenterCenterSection" className="md:w-[60%] w-[60%] p-2 md:p-4 overflow-y-auto cursor-ew-resize">
             {renderCenterContent()}
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsCenterRightSection" className="md:w-[20%] w-[20%] p-2 md:p-4 border-l overflow-y-auto">
             <div className="flex items-center justify-center mb-2 md:mb-4">
                 <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => navigateCenterRight('left')}><ChevronLeft className="h-3 w-3 md:h-4 md:w-4" /></Button>
                 <h3 className="text-center font-bold mx-1 md:mx-2 text-xs md:text-base">{centerRightView}</h3>
                 <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => navigateCenterRight('right')}><ChevronRight className="h-3 w-3 md:h-4 md:w-4" /></Button>
             </div>
             <div className="space-y-1 md:space-y-4">
               {renderCenterRightContent()}
             </div>
           </div>
         </div>

        {/* Bottom Section */}
        <div className="flex border-t md:h-auto h-12">
          <div id="MainUhubFeatureV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-1 md:p-4 border-r flex items-center">
            <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => handleSocialNavLeft('left')}><ChevronLeft className="h-3 w-3 md:h-4 md:w-4" /></Button>
            <div className="flex-grow grid grid-cols-3 gap-0.5 md:gap-4 place-items-center">
              {socialLinkPagesLeft[socialPageLeft].map(link => (
                <div key={link.id} className="text-xs md:text-base">
                  <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => handleSocialNavLeft('right')}><ChevronRight className="h-3 w-3 md:h-4 md:w-4" /></Button>
          </div>
          <div id="MainUhubFeatureV001ForMyProfileSettingsBottomCenterSection" className="w-[60%] p-1 md:p-4 flex items-center justify-center">
            <a href="https://uminion.com/product/union-card-the-official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs md:text-base">
              Become an Official Member of the Union via getting your Union Card Today!
            </a>
          </div>
          <div id="MainUhubFeatureV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-1 md:p-4 border-l flex items-center">
             <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => handleSocialNavRight('left')}><ChevronLeft className="h-3 w-3 md:h-4 md:w-4" /></Button>
            <div className="flex-grow grid grid-cols-3 gap-0.5 md:gap-4 place-items-center">
              {socialLinkPagesRight[socialPageRight].map(link => (
                <div key={link.id} className="text-xs md:text-base">
                  <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => handleSocialNavRight('right')}><ChevronRight className="h-3 w-3 md:h-4 md:w-4" /></Button>
          </div>
        </div>
      </div>
      
      {activeChatModal !== null && (
        <MainUhubFeatureV001ForChatModal
          isOpen={activeChatModal !== null}
          onClose={handleCloseChatModal}
          pageName={MainUhubFeatureV001ForSisterUnionPages[activeChatModal - 1]}
          backgroundColor={MainUhubFeatureV001ForModalColors[activeChatModal - 1]}
          modalNumber={activeChatModal}
        />
      )}
      {isAddProductModalOpen && (
        <MainUhubFeatureV001ForAddProductModal isOpen={isAddProductModalOpen} onClose={() => setAddProductModalOpen(false)} />
      )}
      {isProductDetailModalOpen && (
        <MainUhubFeatureV001ForProductDetailModal isOpen={isProductDetailModalOpen} onClose={() => setProductDetailModalOpen(false)} product={selectedProduct} />
      )}
    </>
  );
};

export default MainUhubFeatureV001ForMyProfileModal;
