import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X, Mountain } from 'lucide-react';
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { useAuth } from '../../hooks/useAuth';
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

// All 30 stores in your database
const ALL_STORES = [
  { id: 0, name: 'Union Main Store', number: 0 },
  { id: 1, name: 'NewEngland', number: 1 },
  { id: 2, name: 'UnionStore', number: 2 },
  { id: 3, name: 'UnionEconomic', number: 3 },
  { id: 4, name: 'UnionEnvironment', number: 4 },
  { id: 5, name: 'UnionHealth', number: 5 },
  { id: 6, name: 'UnionEducation', number: 6 },
  { id: 7, name: 'UnionCulture', number: 7 },
  { id: 8, name: 'UnionTech', number: 8 },
  { id: 9, name: 'UnionCreate', number: 9 },
  { id: 10, name: 'UnionCommunity', number: 10 },
  { id: 11, name: 'UnionWelcome', number: 11 },
  { id: 12, name: 'UnionEvent', number: 12 },
  { id: 13, name: 'UnionConnections', number: 13 },
  { id: 14, name: 'UnionNews', number: 14 },
  { id: 15, name: 'UnionRadio', number: 15 },
  { id: 16, name: 'UnionFood', number: 16 },
  { id: 17, name: 'UnionTravel', number: 17 },
  { id: 18, name: 'UnionHomeLiving', number: 18 },
  { id: 19, name: 'UnionPolitic', number: 19 },
  { id: 20, name: 'UnionSAM', number: 20 },
  { id: 21, name: 'UnionArtisan', number: 21 },
  { id: 22, name: 'UnionBooks', number: 22 },
  { id: 23, name: 'UnionGames', number: 23 },
  { id: 24, name: 'UnionFitness', number: 24 },
  { id: 25, name: 'UnionArena', number: 25 },
  { id: 26, name: 'UnionTrades', number: 26 },
  { id: 27, name: 'UnionSecret', number: 27 },
  { id: 28, name: 'UnionSports', number: 28 },
  { id: 29, name: 'UnionHousing', number: 29 },
  { id: 30, name: 'UnionHealthcare', number: 30 },
];

const socialLinksLeft = [
  { id: 'facebook', href: 'https://www.facebook.com/groups/1615679026489537', icon: <Facebook /> },
  { id: 'bluesky', href: 'https://bsky.app/profile/uminion.bsky.social', icon: <MessageSquare /> },
  { id: 'github', href: 'https://github.com/uminionunion/uminionswebsite', icon: <Github /> },
  { id: 'youtube', href: 'https://www.youtube.com/@UminionUnion', icon: <Youtube /> },
  { id: 'twitch', href: 'https://www.twitch.tv/theuminionunion', icon: <Twitch /> },
  { id: 'discord', href: 'https://discord.com/login?redirect_to=%2Flogin%3Fredirect_to%3D%252Fchannels%252F1357919291428573204%252F1357919292280144075', icon: 'D' },
  { id: 'page2-1', href: 'https://example.com/page2-1', icon: 'L1' },
  { id: 'page2-2', href: 'https://example.com/page2-2', icon: 'L2' },
  { id: 'page2-3', href: 'https://example.com/page2-3', icon: 'L3' },
  { id: 'page2-4', href: 'https://example.com/page2-4', icon: 'L4' },
  { id: 'page2-5', href: 'https://example.com/page2-5', icon: 'L5' },
  { id: 'page2-6', href: 'https://example.com/page2-6', icon: 'L6' },
];

const socialLinksRight = [
  { id: 'instagram', href: 'https://www.instagram.com/theuminionunion/?igsh=ajdjeGUycHRmczVs&ut-m_source=qr#', icon: <Instagram /> },
  { id: 'mastodon', href: 'https://mastodon.social/@uminion', icon: 'M' },
  { id: 'githubDiscussions', href: 'https://github.com/uminionunion/UminionsWebsite/discussions', icon: <Github /> },
  { id: 'threads', href: 'https://www.threads.com/@theuminionunion', icon: '@' },
  { id: 'patreon', href: 'https://www.patreon.com/uminion', icon: 'P' },
  { id: 'githubIssues', href: 'https://github.com/uminionunion/UminionsWebsite/issues', icon: <Github /> },
  { id: 'page2-r1', href: 'https://example.com/page2-r1', icon: 'R1' },
  { id: 'page2-r2', href: 'https://example.com/page2-r2', icon: 'R2' },
  { id: 'page2-r3', href: 'https://example.com/page2-r3', icon: 'R3' },
  { id: 'page2-r4', href: 'https://example.com/page2-r4', icon: 'R4' },
  { id: 'page2-r5', href: 'https://example.com/page2-r5', icon: 'R5' },
  { id: 'page2-r6', href: 'https://example.com/page2-r6', icon: 'R6' },
];

const MainUhubFeatureV001ForSocialIcon = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
    {children}
  </a>
);

interface Product {
  id: number;
  name: string;
  price: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  url?: string;
  time?: string;
  location?: string;
}

const ProductBox = ({ product, onMagnify, onAddToCart }) => {
    const [inCart, setInCart] = useState(false);

    const handleCartClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!inCart) {
        onAddToCart(product);
      }
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
  const MainUhubFeatureV001ForUHomeHubButtons = Array.from({ length: 30 }, (_, i) => i + 1); // NOW 30 BUTTONS
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [products, setProducts] = useState<Record<number, Product[]>>({});
  const [selectedStoreId, setSelectedStoreId] = useState<number>(20); // UnionSAM default
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [centerView, setCenterView] = useState('stores');
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [socialPageLeft, setSocialPageLeft] = useState(0);
  const [socialPageRight, setSocialPageRight] = useState(0);
  const [leftWidthMobile, setLeftWidthMobile] = useState(25);
  const [centerWidthMobile, setCenterWidthMobile] = useState(50);
  const [rightWidthMobile, setRightWidthMobile] = useState(25);
  const [leftWidthDesktop, setLeftWidthDesktop] = useState(20);
  const [centerWidthDesktop, setCenterWidthDesktop] = useState(60);
  const [rightWidthDesktop, setRightWidthDesktop] = useState(20);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  const [showQuadrants, setShowQuadrants] = useState(false); // Hiker button toggle

  const [broadcastView, setBroadcastView] = useState('UnionNews#14');
  const broadcasts = {
      'UnionNews#14': { title: 'Broadcasts- UnionNews#14', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union News #14: The latest news.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.15-Made-on-NC-JPEG.png', extraImages: ['https://page001.uminion.com/StoreProductsAndImagery/TapestryVersion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/Tshirtbatchversion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/UkraineLogo001.png'], description: 'Union Tech #18 is presently upgrading our uminion website from v1 to v2; so some features will be considered -underConstruction- until the upgrade is done. For now, be sure to join us over at FB; till our own Social Media site is live:', website: 'https://www.facebook.com/groups/1615679026489537' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union Radio #15.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.16-Made-on-NC-JPEG.png', extraImages: [], description: 'Union Radio #15 (along with uminionClassic) is still live, but now over at our SisterPage: "https://page001.uminion.com/"!', website: 'https://uminion.com' },
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

  // Load products for each store
  useEffect(() => {
    const loadStoreProducts = async () => {
      const allProducts: Record<number, Product[]> = {};
      
      for (const store of ALL_STORES) {
        try {
          const response = await fetch(`/api/products/store/${store.id}`);
          if (response.ok) {
            allProducts[store.id] = await response.json();
          }
        } catch (error) {
          console.error(`Error loading store ${store.id}:`, error);
          allProducts[store.id] = [];
        }
      }
      
      setProducts(allProducts);
    };

    loadStoreProducts();
  }, []);

  const handleMagnify = (product: Product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? p : p);
      }
      return [...prev, product];
    });
    
    // Also add to backend cart if authenticated
    if (user) {
      fetch('/api/products/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      }).catch(err => console.error('Error adding to cart:', err));
    }
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
    'SisterUnion025', 'SisterUnion026', 'SisterUnion027', 'SisterUnion028', 'SisterUnion029', 'SisterUnion030',
  ];
  const MainUhubFeatureV001ForModalColors = Array.from({ length: 30 }, (_, i) => `hsl(${i * 12}, 70%, 50%)`);

  const handleUHomeHubClick = (buttonNumber: number) => setActiveChatModal(buttonNumber);
  const handleCloseChatModal = () => setActiveChatModal(null);

  const handleStartDragMobile = () => {
    setIsDraggingLeft(true);
  };

  const handleStartDragRight = () => {
    setIsDraggingRight(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingLeft && !isDraggingRight) return;
      const container = document.querySelector('[id*="CenterLeftSection"]')?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newLeft = ((e.clientX - rect.left) / rect.width) * 100;
      if (newLeft > 15 && newLeft < 85) {
        const leftPercent = newLeft;
        const total = 100;
        const remainingPercent = total - leftPercent;
        if (isDraggingLeft) {
          setLeftWidthMobile(leftPercent);
          setCenterWidthMobile(remainingPercent * 0.6);
          setRightWidthMobile(remainingPercent * 0.4);
          setLeftWidthDesktop(leftPercent);
          setCenterWidthDesktop(remainingPercent * 0.6);
          setRightWidthDesktop(remainingPercent * 0.4);
        }
        if (isDraggingRight) {
          const centerPercent = (e.clientX - rect.left) / rect.width * 100;
          if (centerPercent > 15 && centerPercent < 85) {
            setCenterWidthMobile(centerPercent);
            const remaining = 100 - leftWidthMobile - centerPercent;
            setRightWidthMobile(remaining);
            setCenterWidthDesktop(centerPercent);
            const remainingDesktop = 100 - leftWidthDesktop - centerPercent;
            setRightWidthDesktop(remainingDesktop);
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, leftWidthMobile, leftWidthDesktop]);

  const renderCenterContent = () => {
    switch (centerView) {
        case 'friends':
            return <MainUhubFeatureV001ForFriendsView pendingRequests={pendingFriendRequests} setPendingRequests={setPendingFriendRequests} />;
        case 'settings':
            return <MainUhubFeatureV001ForSettingsView />;
        case 'broadcasts':
            const currentBroadcast = broadcasts[broadcastView];
            return (
                <>
                    <div className="flex items-center justify-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => {
                          const currentIndex = broadcastKeys.indexOf(broadcastView);
                          const nextIndex = (currentIndex - 1 + broadcastKeys.length) % broadcastKeys.length;
                          setBroadcastView(broadcastKeys[nextIndex]);
                        }}>
                            <ChevronLeft />
                        </Button>
                        <h3 className="text-center font-bold mx-4">{currentBroadcast?.title || 'MyBroadcasts'}</h3>
                        <Button variant="ghost" size="icon" onClick={() => {
                          const currentIndex = broadcastKeys.indexOf(broadcastView);
                          const nextIndex = (currentIndex + 1) % broadcastKeys.length;
                          setBroadcastView(broadcastKeys[nextIndex]);
                        }}>
                            <ChevronRight />
                        </Button>
                    </div>
                    {broadcastView === 'MyBroadcasts' ? 
                        (user ? <CreateBroadcastView /> : <p className="text-center text-muted-foreground">You must be logged in to create a broadcast.</p>) 
                        : (currentBroadcast ? <BroadcastView broadcast={currentBroadcast} /> : <p>Broadcast not found.</p>)}
                </>
            );
        case 'stores':
        default:
            const currentStoreProducts = products[selectedStoreId] || [];
            const storeInfo = ALL_STORES.find(s => s.id === selectedStoreId);
            return (
                <>
                    <div className="flex items-center justify-center mb-4">
                        <Button variant="ghost" size="icon" onClick={() => {
                          const currentIndex = ALL_STORES.findIndex(s => s.id === selectedStoreId);
                          const nextIndex = (currentIndex - 1 + ALL_STORES.length) % ALL_STORES.length;
                          setSelectedStoreId(ALL_STORES[nextIndex].id);
                        }}>
                            <ChevronLeft />
                        </Button>
                        <h3 className="text-center font-bold mx-4">{storeInfo?.name} #{storeInfo?.number}</h3>
                        <Button variant="ghost" size="icon" onClick={() => {
                          const currentIndex = ALL_STORES.findIndex(s => s.id === selectedStoreId);
                          const nextIndex = (currentIndex + 1) % ALL_STORES.length;
                          setSelectedStoreId(ALL_STORES[nextIndex].id);
                        }}>
                            <ChevronRight />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {currentStoreProducts.length > 0 ? (
                            currentStoreProducts.map(p => <ProductBox key={p.id} product={p} onMagnify={handleMagnify} onAddToCart={handleAddToCart} />)
                        ) : (
                            <p className="text-center text-muted-foreground">No products in this store yet.</p>
                        )}
                    </div>
                </>
            );
    }
  };

  const handleTopLeftButtonClick = (view: string) => {
    if (!user && view !== 'broadcasts') {
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

  const isMobile = window.innerWidth < 768;
  const itemsPerPage = isMobile ? 1 : 6;
  const socialLinkPagesLeft = Array.from({ length: Math.ceil(socialLinksLeft.length / itemsPerPage) }, (_, i) => socialLinksLeft.slice(i * itemsPerPage, (i + 1) * itemsPerPage));
  const socialLinkPagesRight = Array.from({ length: Math.ceil(socialLinksRight.length / itemsPerPage) }, (_, i) => socialLinksRight.slice(i * itemsPerPage, (i + 1) * itemsPerPage));

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
             <Button variant="outline" className="flex flex-col h-full items-center justify-center relative text-xs" title="Friends" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
               {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
               <Users className="h-4 w-4 mb-1" /> Friends
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Broadcast" onClick={() => handleTopLeftButtonClick('broadcasts')}><Megaphone className="h-4 w-4 mb-1" /> Broadcast</Button>
             <a href="https://github.com/uminionunion/GitHubQuestIssue34" target="_blank" rel="noopener noreferrer" className="w-full h-full">
               <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center text-xs" title="Code" disabled={!user}><Code className="h-4 w-4 mb-1" /> Code</Button>
             </a>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="h-4 w-4 mb-1" /> Settings</Button>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-3/5 h-32 md:h-40 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.19-Made-on-NC-JPEG.png')" }}>
             {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopRightSection" className="md:w-1/5 flex flex-col justify-start md:justify-end items-end md:pl-4 gap-2">
             <div onClick={handleProfileImageClick} className="cursor-pointer">
               <Avatar className="h-24 w-24 md:h-32 md:w-32">
                 <AvatarImage src={user?.profile_image_url || "https://page001.uminion.com/wp-content/uploads/2025/12/Uminion-U-Logo.jpg"} alt="Profile" />
                 <AvatarFallback>U</AvatarFallback>
               </Avatar>
             </div>
             {user && <Button size="sm" className="absolute top-8 right-2">Edit</Button>}
             {/* HIKER BUTTON (QUADRANTS) - Now shows all 30 stores */}
             <Button 
               size="sm" 
               variant={showQuadrants ? "default" : "outline"}
               onClick={() => setShowQuadrants(!showQuadrants)}
               className="mt-2"
               title="View Store Quadrants"
             >
               <Mountain className="h-4 w-4 mr-1" /> Hiker
             </Button>
             <div className={`absolute top-40 right-2 bg-background border rounded-md p-2 grid grid-cols-6 gap-1 ${showQuadrants ? 'block' : 'hidden'}`} style={{width: '300px'}}>
               {ALL_STORES.map(store => (
                 <Button
                   key={store.id}
                   size="sm"
                   variant={selectedStoreId === store.id ? "default" : "outline"}
                   onClick={() => {
                     setSelectedStoreId(store.id);
                     setCenterView('stores');
                     setShowQuadrants(false);
                   }}
                   className="text-xs h-6"
                   title={store.name}
                 >
                   #{store.number}
                 </Button>
               ))}
             </div>
             <div className="absolute bottom-2 right-2 flex items-center gap-2">
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
               <Button variant="outline" className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1" title="Friends" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
                 {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>}
                 <Users className="h-3 w-3" /><span className="text-xxs">Friends</span>
               </Button>
               <Button variant="outline" className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1" title="Broadcast" onClick={() => handleTopLeftButtonClick('broadcasts')}>
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
           <div className="h-24 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://page001.uminion.com/StoreProductsAndImagery/UminionLogo28.2024Classic.png')" }}>
             {user && <Button className="absolute bottom-1 right-1 text-xs h-6" size="sm">Change</Button>}
           </div>
         </div>

         {/* Center Section */}
         <div className="flex-grow flex overflow-hidden">
           <div id="MainUhubFeatureV001ForMyProfileSettingsCenterLeftSection" className="md:border-r overflow-y-auto p-2 md:p-4" style={{ width: window.innerWidth < 768 ? `${leftWidthMobile}%` : `${leftWidthDesktop}%` }}>
             <h3 className="text-center font-bold mb-2 md:mb-4 text-xs md:text-base">uHome-Hub:</h3>
             <div className="grid grid-cols-2 gap-1 md:gap-2">
               {MainUhubFeatureV001ForUHomeHubButtons.map(num => (
                 <Button key={num} variant="outline" size="sm" className="md:h-auto h-6 text-xs" onClick={() => handleUHomeHubClick(num)}>#{String(num).padStart(2, '0')}</Button>
               ))}
             </div>
           </div>
           <div className="w-1 bg-gray-300 cursor-ew-resize hover:bg-blue-500" onMouseDown={handleStartDragMobile}></div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsCenterCenterSection" className="p-2 md:p-4 overflow-y-auto" style={{ width: window.innerWidth < 768 ? `${centerWidthMobile}%` : `${centerWidthDesktop}%` }}>
             {renderCenterContent()}
           </div>
           <div className="w-1 bg-gray-300 cursor-ew-resize hover:bg-green-500" onMouseDown={handleStartDragRight}></div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsCenterRightSection" className="md:border-l overflow-y-auto p-2 md:p-4" style={{ width: window.innerWidth < 768 ? `${rightWidthMobile}%` : `${rightWidthDesktop}%` }}>
             <div className="flex items-center justify-between mb-2 md:mb-4">
                 <h3 className="text-center font-bold text-xs md:text-base">Cart ({cart.length})</h3>
                 <span className="text-xs text-muted-foreground">Your Shopping Cart</span>
             </div>
             <div className="space-y-1 md:space-y-4">
               {cart.length > 0 ? (
                 cart.map(p => <ProductBox key={p.id} product={p} onMagnify={handleMagnify} onAddToCart={() => {}} />)
               ) : (
                 <p className="text-center text-muted-foreground text-sm">Your cart is empty</p>
               )}
             </div>
           </div>
         </div>

          {/* Bottom Section */}
          <div className="flex border-t md:h-auto h-12">
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomLeftSection" className="w-[20%] p-1 md:p-2 border-r flex items-center">
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavLeft('left')}><ChevronLeft className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
              <div className="flex-grow hidden md:grid grid-cols-3 gap-0.5 md:gap-2 place-items-center">
                {socialLinkPagesLeft[socialPageLeft].map(link => (
                  <div key={link.id} className="text-xs md:text-xs">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <div className="flex-grow md:hidden flex justify-center items-center">
                {socialLinkPagesLeft[socialPageLeft].slice(0, 1).map(link => (
                  <div key={link.id} className="text-2xl">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavLeft('right')}><ChevronRight className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomCenterSection" className="w-[60%] p-1 md:p-2 flex items-center justify-center">
              <a href="https://page001.uminion.com/product/official-uminion-union-card/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-xs md:text-sm">
                Become an Official Member of the Union via getting your Union Card Today!
              </a>
            </div>
            <div id="MainUhubFeatureV001ForMyProfileSettingsBottomRightSection" className="w-[20%] p-1 md:p-2 border-l flex items-center">
               <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavRight('left')}><ChevronLeft className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
              <div className="flex-grow hidden md:grid grid-cols-3 gap-0.5 md:gap-2 place-items-center">
                {socialLinkPagesRight[socialPageRight].map(link => (
                  <div key={link.id} className="text-xs md:text-xs">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <div className="flex-grow md:hidden flex justify-center items-center">
                {socialLinkPagesRight[socialPageRight].slice(0, 1).map(link => (
                  <div key={link.id} className="text-2xl">
                    <MainUhubFeatureV001ForSocialIcon href={link.href}>{link.icon}</MainUhubFeatureV001ForSocialIcon>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 md:h-6 md:w-6 p-1" onClick={() => handleSocialNavRight('right')}><ChevronRight className="h-3 w-3 md:h-2.5 md:w-2.5" /></Button>
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
