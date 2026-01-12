import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Users, Megaphone, Code, Settings, Facebook, Youtube, Twitch, Instagram, Github, MessageSquare, ShoppingCart, Eye, ChevronLeft, ChevronRight, Plus, Minus, Search, Play, X, Mountain, Home, ChevronDown, ChevronUp } from 'lucide-react';
import MainUhubFeatureV001ForChatModal from '../uminion/MainUhubFeatureV001ForChatModal';
import { useAuth } from '../../hooks/useAuth';
import MainUhubFeatureV001ForAddProductModal from './MainUhubFeatureV001ForAddProductModal';
import MainUhubFeatureV001ForProductDetailModal from './MainUhubFeatureV001ForProductDetailModal';
import MainUhubFeatureV001ForFriendsView from './MainUhubFeatureV001ForFriendsView';
import MainUhubFeatureV001ForSettingsView from './MainUhubFeatureV001ForSettingsView';
import { CreateBroadcastView } from './CreateBroadcastView';
import BroadcastCarousel from './BroadcastCarousel';

interface MainUhubFeatureV001ForMyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'signup') => void;
}

const ALL_STORES = [
  { id: 0, name: 'Union Main Store', number: 0, displayName: 'Union Main Store#0' },
  { id: 1, name: 'NewEngland', number: 1, displayName: '#01' },
  { id: 2, name: 'UnionStore', number: 2, displayName: '#02' },
  { id: 3, name: 'UnionEconomic', number: 3, displayName: '#03' },
  { id: 4, name: 'UnionEnvironment', number: 4, displayName: '#04' },
  { id: 5, name: 'UnionHealth', number: 5, displayName: '#05' },
  { id: 6, name: 'UnionEducation', number: 6, displayName: '#06' },
  { id: 7, name: 'UnionCulture', number: 7, displayName: '#07' },
  { id: 8, name: 'UnionTech', number: 8, displayName: '#08' },
  { id: 9, name: 'UnionCreate', number: 9, displayName: '#09' },
  { id: 10, name: 'UnionCommunity', number: 10, displayName: '#10' },
  { id: 11, name: 'UnionWelcome', number: 11, displayName: '#11' },
  { id: 12, name: 'UnionEvent', number: 12, displayName: 'UnionEvent#12' },
  { id: 13, name: 'UnionConnections', number: 13, displayName: '#13' },
  { id: 14, name: 'UnionNews', number: 14, displayName: '#14' },
  { id: 15, name: 'UnionRadio', number: 15, displayName: '#15' },
  { id: 16, name: 'UnionFood', number: 16, displayName: '#16' },
  { id: 17, name: 'UnionTravel', number: 17, displayName: '#17' },
  { id: 18, name: 'UnionHomeLiving', number: 18, displayName: '#18' },
  { id: 19, name: 'UnionPolitic', number: 19, displayName: 'UnionPolitic#19' },
  { id: 20, name: 'UnionSAM', number: 20, displayName: 'UnionSAM#20' },
  { id: 21, name: 'UnionArtisan', number: 21, displayName: '#21' },
  { id: 22, name: 'UnionBooks', number: 22, displayName: '#22' },
  { id: 23, name: 'UnionGames', number: 23, displayName: '#23' },
  { id: 24, name: 'UnionFitness', number: 24, displayName: '#24' },
  { id: 25, name: 'UnionArena', number: 25, displayName: '#25' },
  { id: 26, name: 'UnionTrades', number: 26, displayName: '#26' },
  { id: 27, name: 'UnionSecret', number: 27, displayName: '#27' },
  { id: 28, name: 'UnionSports', number: 28, displayName: '#28' },
  { id: 29, name: 'UnionHousing', number: 29, displayName: '#29' },
  { id: 30, name: 'UnionHealthcare', number: 30, displayName: '#30' },
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
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  url?: string;
  time?: string;
  location?: string;
  store_id?: number;
  sku_id?: string;
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
    <div className="flex flex-col gap-4">
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
                <a href={broadcast.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm">Visit Website</a>
            </div>
        </div>
        <BroadcastCarousel />
    </div>
);

// QUADRANTS MODAL - PAGE 1 REDESIGNED
const QuadrantsModal = ({ isOpen, onClose, stores, onSelectStore, user }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [myStoreView, setMyStoreView] = useState<'list' | 'add-product'>('list');
  const [refreshMyStoreProducts, setRefreshMyStoreProducts] = useState(false);
  
  const storePages = [
    [],
    [stores[1], stores[2], stores[3], stores[4]],
    [stores[5], stores[6], stores[7], stores[8]],
    [stores[9], stores[10], stores[11], stores[12]],
    [stores[13], stores[14], stores[15], stores[16]],
    [stores[17], stores[18], stores[19], stores[20]],
    [stores[21], stores[22], stores[23], stores[24]],
    [stores[25], stores[26], stores[27], stores[28]],
    [stores[29], stores[30], null, null],
    [null, null, null, null],
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-background border rounded-lg p-6 max-w-6xl w-[95%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Store Quadrants (All 30 Stores)</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* PAGE 1 - REDESIGNED LAYOUT */}
        {currentPage === 1 && (
          <div className="grid grid-cols-2 gap-4 h-[70vh]">
            {/* TOP LEFT: Union Store */}
            <div className="border rounded-lg p-4 flex flex-col h-full">
              <div className="flex justify-between items-center mb-3 sticky top-0 bg-background">
                <h3 className="font-bold">Union Store</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => {/* refresh */}}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {/* Fetch and display main store products */}
                {/* Same as before - shows all products from store #0 */}
              </div>
            </div>

            {/* TOP RIGHT: Friends Stores */}
            <div className="border rounded-lg p-4 flex flex-col h-full">
              <h3 className="font-bold mb-3 sticky top-0 bg-background">Friends' Stores</h3>
              <div className="flex-1 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                (Friends' products)
              </div>
            </div>

            {/* BOTTOM LEFT: My Store - FULLY REDESIGNED */}
            {/* BOTTOM LEFT: My Store */}
<div className="border rounded-lg p-4 flex flex-col h-full">
  <div className="flex justify-between items-center mb-3 sticky top-0 bg-background">
    <h3 className="font-bold">My Store</h3>
    <div className="flex gap-1">
      <Button 
        variant={myStoreView === 'list' ? 'default' : 'outline'} 
        size="sm" 
        className="h-6 text-xs"
        onClick={() => setMyStoreView('list')}
      >
        List
      </Button>
      <Button 
        variant={myStoreView === 'add-product' ? 'default' : 'outline'} 
        size="sm" 
        className="h-6 text-xs"
        onClick={() => setMyStoreView('add-product')}
      >
        + Add
      </Button>
    </div>
  </div>

  <div className="flex-1 overflow-y-auto">
    {myStoreView === 'list' ? (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Your products list would appear here</p>
      </div>
    ) : (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Your products list would appear here</p>
      </div>
    ) : (
      <div className="space-y-4">
        {/* Add Product Form - Role-Based */}
        {user.is_high_high_high_admin === 1 ? (
          <div>
            <h4 className="font-semibold mb-3 text-sm">Add to Main Store (WooCommerce)</h4>
            <p className="text-xs text-green-400 mb-3">✓ You are logged in as HIGH-HIGH-HIGH Admin</p>
            <div className="space-y-3 text-sm">
              <input type="text" placeholder="Product Name" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <input type="number" placeholder="Price" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <input type="text" placeholder="WooCommerce SKU (optional)" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <input type="file" accept="image/*" className="w-full text-xs" />
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-sm h-8">
                Add to Main Store
              </Button>
            </div>
          </div>
        ) : user.is_high_high_admin === 1 ? (
          <div>
            <h4 className="font-semibold mb-3 text-sm">Add to Store #01-#30</h4>
            <p className="text-xs text-green-400 mb-3">✓ You are logged in as HIGH-HIGH Admin</p>
            <div className="space-y-3 text-sm">
              <select className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm">
                <option value="">Select Store #01-#30</option>
                {Array.from({ length: 30 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Store #{String(i + 1).padStart(2, '0')}</option>
                ))}
              </select>
              <input type="text" placeholder="Product Name" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <input type="number" placeholder="Price" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <input type="file" accept="image/*" className="w-full text-xs" />
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-sm h-8">
                Add Product
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold mb-3 text-sm">Add to Your Personal Store</h4>
            <p className="text-xs text-blue-400 mb-3">✓ You are logged in as Regular User</p>
            <div className="space-y-3 text-sm">
              <input type="text" placeholder="Product Name" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <input type="number" placeholder="Price" className="w-full border rounded px-2 py-1 bg-background text-foreground text-sm" />
              <textarea placeholder="Description" className="w-full border rounded px-2 py-1 bg-background text-foreground text-xs resize-none" rows={3} />
              <input type="file" accept="image/*" className="w-full text-xs" />
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-sm h-8">
                Add Product
              </Button>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</div>

            {/* BOTTOM RIGHT: Empty for now */}
            <div className="border rounded-lg p-4 flex flex-col h-full">
              <h3 className="font-bold mb-3">Reserved</h3>
              <div className="flex-1 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                Coming Soon
              </div>
            </div>
          </div>
        )}

        {/* PAGES 2-10 REMAIN THE SAME */}
        {currentPage > 1 && currentPage <= 9 && (
          <div className="grid grid-cols-2 gap-4 h-[70vh]">
            {storePages[currentPage - 1].map((store) => (
              <div key={store?.id || Math.random()} className="border rounded-lg p-4 flex flex-col">
                <h3 className="font-bold mb-3">{store?.displayName || 'Coming Soon'}</h3>
                <div 
                  className={`flex-1 ${store ? 'bg-muted rounded-md bg-cover bg-center cursor-pointer' : 'bg-muted rounded-md flex items-center justify-center text-muted-foreground'}`}
                  onClick={() => {
                    if (store) {
                      onSelectStore(store);
                      onClose();
                    }
                  }}
                  style={store ? {backgroundImage: `url('https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.13-Made-on-NC-JPEG.png')`} : {}}
                  title={store ? `Click to view ${store.name}` : 'Coming soon'}
                >
                  {!store && 'Coming Soon'}
                </div>
              </div>
            ))}</div>
        )}

        {currentPage === 10 && (
          <div className="grid grid-cols-2 gap-4 h-[70vh]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg p-4 flex items-center justify-center text-muted-foreground">
                Coming Soon
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <span className="text-sm font-semibold">Page {currentPage} of 10</span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(10, prev + 1))}
            disabled={currentPage === 10}
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// HOME MODAL
const HomeModal = ({ isOpen, onClose }) => {
  const [myAccountExpanded, setMyAccountExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-background border rounded-lg p-6 max-w-4xl w-[90%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Home</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 h-[70vh]">
          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <button
              onClick={() => setMyAccountExpanded(!myAccountExpanded)}
              className="flex items-center justify-between font-bold mb-4 hover:text-orange-400 transition"
            >
              My Account{myAccountExpanded ? '-' : '+'}
              {myAccountExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {myAccountExpanded && (
              <div className="space-y-3 flex-1 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow others to see friends list</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to see posts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to see friends list</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Allow non-logged in users to like and comment on posts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-gray-700 border border-gray-600 cursor-pointer" />
                  <span className="text-sm">Only friends can see posts</span>
                </label>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Store</h3>
            <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
              Your store preview appears here when visitors come to your profile
            </div>
          </div>

          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Posts</h3>
            <textarea 
              className="w-full p-3 border rounded mb-2 bg-gray-800 text-white placeholder-gray-500 flex-1 resize-none" 
              placeholder="Write a post..." 
              rows={3}
            ></textarea>
            <Button className="w-full bg-orange-400 hover:bg-orange-500">Create Post</Button>
          </div>

          <div className="border rounded-lg p-4 overflow-auto flex flex-col">
            <h3 className="font-bold mb-4">My Feed</h3>
            <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
              Posts from friends appear here
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 mt-4 h-32 overflow-auto">
          <h3 className="font-bold mb-3">My Inventory</h3>
          <div className="text-center text-muted-foreground">
            Custom features you've purchased appear here
          </div>
        </div>
      </div>
    </div>
  );
};

const MainUhubFeatureV001ForMyProfileModal: React.FC<MainUhubFeatureV001ForMyProfileModalProps> = ({ isOpen, onClose, onOpenAuthModal }) => {
  const { user } = useAuth();
  const MainUhubFeatureV001ForUHomeHubButtons = Array.from({ length: 30 }, (_, i) => i + 1);
  const [activeChatModal, setActiveChatModal] = useState<number | null>(null);
  const [storeProducts, setStoreProducts] = useState<{ [key: number]: Product[] }>({});
  const [mainStoreProducts, setMainStoreProducts] = useState<Product[]>([]);
  const [userStoreProducts, setUserStoreProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [centerRightView, setCenterRightView] = useState(ALL_STORES[20]);
  const [isAddProductModalOpen, setAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailModalOpen, setProductDetailModalOpen] = useState(false);
  const [centerView, setCenterView] = useState('broadcasts');
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
  const [isQuadrantsModalOpen, setIsQuadrantsModalOpen] = useState(false);
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

  const [broadcastView, setBroadcastView] = useState('UnionNews#14');
  const broadcasts = {
      'UnionNews#14': { title: 'Broadcasts- UnionNews#14', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union News #14: The latest news.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.15-Made-on-NC-JPEG.png', extraImages: ['https://page001.uminion.com/StoreProductsAndImagery/TapestryVersion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/Tshirtbatchversion001.png', 'https://page001.uminion.com/StoreProductsAndImagery/UkraineLogo001.png'], description: 'Union Tech #18 is presently upgrading our uminion website from v1 to v2; so some features will be considered -underConstruction- until the upgrade is done. For now, be sure to join us over at FB; till our own Social Media site is live:', website: 'https://www.facebook.com/groups/1615679026489537' },
      'UnionRadio#15': { title: 'Broadcasts- UnionRadio#15', creator: 'StorytellingSalem', subtitle: 'Under Construction- Union Radio #15.', logo: 'https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.16-Made-on-NC-JPEG.png', extraImages: [], description: 'Union Radio #15 (along with uminionClassic) is still live, but now over at our SisterPage: \"https://page001.uminion.com/\"!', website: 'https://uminion.com' },
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

  // Fetch database products for all stores
  useEffect(() => {
    const fetchAllProducts = async () => {
      setIsLoadingProducts(true);
      try {
        // Fetch main store products (store #0)
        const mainRes = await fetch('/api/products/store/0');
        const mainData = await mainRes.json();
        setMainStoreProducts(Array.isArray(mainData) ? mainData : []);

        // Fetch current user's products if logged in
        if (user) {
          const userRes = await fetch(`/api/products/user/${user.id}`);
          const userData = await userRes.json();
          setUserStoreProducts(Array.isArray(userData) ? userData : []);
        }

        // Fetch products for each store #01-#30
        const storeProductsMap: { [key: number]: Product[] } = {};
        for (let storeNum = 1; storeNum <= 30; storeNum++) {
          try {
            const storeRes = await fetch(`/api/products/store/${storeNum}`);
            const storeData = await storeRes.json();
            storeProductsMap[storeNum] = Array.isArray(storeData) ? storeData : [];
          } catch (error) {
            console.error(`Error fetching products for store ${storeNum}:`, error);
            storeProductsMap[storeNum] = [];
          }
        }
        setStoreProducts(storeProductsMap);
      } catch (error) {
        console.error('Error fetching products:', error);
        setMainStoreProducts([]);
        setUserStoreProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (isOpen) {
      fetchAllProducts();
    }
  }, [user, isOpen]);

  const handleMagnify = (product: Product) => {
    setSelectedProduct(product);
    setProductDetailModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    if (user) {
      fetch('/api/products/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      }).catch(err => console.error('Error adding to cart:', err));
    }
  };

  const getCartUrl = (product: Product | null): string => {
    if (!product) {
      return 'https://page001.uminion.com/cart/';
    }

    // If product has SKU, link directly to WooCommerce with SKU
    if (product.sku_id) {
      return `https://page001.uminion.com/cart/?add-to-cart=${encodeURIComponent(product.sku_id)}`;
    }

    // Default to general cart
    return 'https://page001.uminion.com/cart/';
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
    'SisterUnion025UnionArena', 'SisterUnion026UnionTradeEnergyAndCommunityWIFI', 'SisterUnion027Secret027', 'SisterUnion028Sports', 'SisterUnion029WheelsVehiclesAndeMods', 'SisterUnion030HousingAndHealthcare',
  ];
  const MainUhubFeatureV001ForModalColors = Array.from({ length: 30 }, (_, i) => `hsl(${i * 12}, 70%, 50%)`);

  const handleUHomeHubClick = (buttonNumber: number) => setActiveChatModal(buttonNumber);
  const handleCloseChatModal = () => setActiveChatModal(null);

  const navigateCenterRight = (direction: 'left' | 'right') => {
    const currentIndex = ALL_STORES.findIndex(s => s.id === centerRightView.id);
    const nextIndex = (currentIndex + (direction === 'right' ? 1 : -1) + ALL_STORES.length) % ALL_STORES.length;
    setCenterRightView(ALL_STORES[nextIndex]);
  };

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

  const renderCenterRightContent = () => {
    const mainProducts = mainStoreProducts.length > 0 ? mainStoreProducts : [];
    const userProducts = userStoreProducts.length > 0 ? userStoreProducts : [];
    const isUnionSAM20 = centerRightView.number === 20;
    const isUnionPolitic19 = centerRightView.number === 19;

    return (
        <>
            {isUnionSAM20 && (
                <>
                    <div id="MainUhubFeatureV001ForUnionStore" className="border rounded-md p-2">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-center flex-1">Union Store</h4>
                            <a href={getCartUrl(mainProducts[0] || null)} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white">
                                    <ShoppingCart className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                        <div className="space-y-2">
                            {isLoadingProducts ? (
                                <div className="text-center text-muted-foreground py-4">Loading products...</div>
                            ) : mainProducts.length > 0 ? (
                                mainProducts.map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} onAddToCart={handleAddToCart} />)
                            ) : (
                                <div className="text-center text-muted-foreground py-4">No products available</div>
                            )}
                        </div>
                    </div>
                    <div id="MainUhubFeatureV001ForUsersStores" className="border rounded-md p-2">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center flex-1">
                                <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white mr-2" onClick={() => {
                                    if (!user) {
                                        alert('You must be logged in to add a product.');
                                        return;
                                    }
                                    setAddProductModalOpen(true)
                                }}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <h4 className="font-semibold text-center flex-1">Users' Stores</h4>
                            </div>
                            <a href="https://page001.uminion.com/cart/" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-black">
                                    <ShoppingCart className="h-4 w-4" />
                                </Button>
                            </a>
                        </div>
                        <div className="space-y-2">
                            {userProducts.length > 0 ? (
                                userProducts.map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} onAddToCart={handleAddToCart} />)
                            ) : (
                                <div className="text-center text-muted-foreground py-4">No products yet</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {isUnionPolitic19 && (
                <div className="border rounded-md p-4 flex items-center justify-center text-muted-foreground h-48">
                    This store is coming soon
                </div>
            )}

            {!isUnionSAM20 && !isUnionPolitic19 && (
                <div id="MainUhubFeatureV001ForStoreColumn" className="border rounded-md p-2 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-center flex-1">Store {String(centerRightView.number).padStart(2, '0')}</h4>
                        <a href={getCartUrl(storeProducts[centerRightView.number]?.[0] || null)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="bg-orange-400 hover:bg-orange-500 text-white">
                                <ShoppingCart className="h-4 w-4" />
                            </Button>
                        </a>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                        {isLoadingProducts ? (
                            <div className="text-center text-muted-foreground py-4">Loading products...</div>
                        ) : (storeProducts[centerRightView.number] && storeProducts[centerRightView.number].length > 0) ? (
                            storeProducts[centerRightView.number].map((p, i) => <ProductBox key={p.id || i} product={p} onMagnify={handleMagnify} onAddToCart={handleAddToCart} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-4">No products available</div>
                        )}
                    </div>
                    <div className="border-t pt-2 mt-auto">
                        <div className="grid grid-cols-2 gap-1">
                            {ALL_STORES.slice(1, 31).map((store) => (
                                <Button
                                    key={store.id}
                                    variant={store.id === centerRightView.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCenterRightView(store)}
                                    className="text-xs h-8"
                                    title={store.name}
                                >
                                    #{String(store.number).padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
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
                    {/* BROADCAST CAROUSEL SECTION */}
                    <BroadcastCarouselSection />
                    
                    {/* EXISTING BROADCAST VIEW */}
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
         <div className="md:flex md:flex-row hidden md:p-4 md:border-b md:gap-2">
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopLeftSection" className="md:w-1/5 grid grid-cols-4 md:grid-cols-2 grid-rows-1 md:grid-rows-2 gap-2 md:pr-4">
             <Button variant="outline" className="flex flex-col h-full items-center justify-center relative text-xs" title="Friends" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
               {pendingFriendRequests.length > 0 && <div className="absolute top-1 right-1 w-3 h-3 bg-orange-500 rounded-full"></div>}
               <Users className="h-4 w-4 mb-1" /> Friends
             </Button>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Broadcast" onClick={() => setCenterView('broadcasts')}><Megaphone className="h-4 w-4 mb-1" /> Broadcast</Button>
             <a href="https://github.com/uminionunion/GitHubQuestIssue34" target="_blank" rel="noopener noreferrer" className="w-full h-full">
               <Button variant="outline" className="w-full h-full flex flex-col items-center justify-center text-xs" title="Code" disabled={!user}><Code className="h-4 w-4 mb-1" /> Code</Button>
             </a>
             <Button variant="outline" className="flex flex-col h-full items-center justify-center text-xs" title="Settings" onClick={() => handleTopLeftButtonClick('settings')} disabled={!user}><Settings className="h-4 w-4 mb-1" /> Settings</Button>
           </div>
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopMiddleSection" className="md:w-2/5 h-32 md:h-40 bg-cover bg-center rounded-md relative" style={{ backgroundImage: "url('https://page001.uminion.com/wp-content/uploads/2025/12/iArt06505.19-Made-on-NC-JPEG.png')" }}>
             {user && <Button className="absolute bottom-2 right-2" size="sm">Change Cover</Button>}
           </div>

            {/* 8-Button Grid - SMALLER BUTTONS */}
            <div className="md:w-1/4 flex justify-center items-center md:pl-4">
              <div className="grid grid-cols-2 gap-1 w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center justify-center h-7 w-7 gap-0 text-xs"
                  onClick={() => setIsQuadrantsModalOpen(true)}
                  title="HikingToAllStores"
                >
                  <Mountain className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex flex-col items-center justify-center h-7 w-7 gap-0 text-xs"
                  onClick={() => {
                    if (!user) {
                      alert("You must be logged in to use this feature.");
                      return;
                    }
                    setIsHomeModalOpen(true);
                  }}
                  title="Home"
                  disabled={!user}
                >
                  <Home className="h-3 w-3" />
                </Button>
                {Array.from({ length: 6 }, (_, i) => (
                  <Button
                    key={i + 3}
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center justify-center h-7 w-7 gap-0 text-xs"
                    onClick={() => setIsQuadrantsModalOpen(true)}
                    title={`Custom ${i + 3}`}
                  >
                    {i + 3}
                  </Button>
                ))}
              </div>
            </div>

           {/* Avatar */}
           <div id="MainUhubFeatureV001ForMyProfileSettingsTopRightSection" className="md:w-1/5 flex justify-center md:justify-end items-start md:pl-4 relative">
             <div onClick={handleProfileImageClick} className="cursor-pointer">
               <Avatar className="h-24 w-24 md:h-32 md:w-32">
                 <AvatarImage src={user?.profile_image_url || "https://page001.uminion.com/wp-content/uploads/2025/12/Uminion-U-Logo.jpg"} alt="Profile" />
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
               <Button variant="outline" className="flex-1 flex flex-col h-10 items-center justify-center text-xs p-1" title="Friends" onClick={() => handleTopLeftButtonClick('friends')} disabled={!user}>
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
             <div className="flex items-center justify-center mb-2 md:mb-4">
                 <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => navigateCenterRight('left')}><ChevronLeft className="h-3 w-3 md:h-4 md:w-4" /></Button>
                 <h3 className="text-center font-bold mx-1 md:mx-2 text-xs md:text-base">{centerRightView.displayName}</h3>
                 <Button variant="ghost" size="icon" className="h-6 w-6 md:h-10 md:w-10 p-1" onClick={() => navigateCenterRight('right')}><ChevronRight className="h-3 w-3 md:h-4 md:w-4" /></Button>
             </div>
             <div className="space-y-1 md:space-y-4">
               {renderCenterRightContent()}
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
  <MainUhubFeatureV001ForAddProductModal 
    isOpen={isAddProductModalOpen} 
    onClose={() => setAddProductModalOpen(false)}
    onProductAdded={() => {
      // Refresh user products
      if (user) {
        fetch(`/api/products/user/${user.id}`)
          .then(res => res.json())
          .then(data => setUserStoreProducts(Array.isArray(data) ? data : []))
          .catch(err => console.error('Error refreshing products:', err));
      }
    }}
  />
)}
        {isProductDetailModalOpen && (
          <MainUhubFeatureV001ForProductDetailModal isOpen={isProductDetailModalOpen} onClose={() => setProductDetailModalOpen(false)} product={selectedProduct} />
        )}
        
        <QuadrantsModal 
          isOpen={isQuadrantsModalOpen}
          onClose={() => setIsQuadrantsModalOpen(false)}
          stores={ALL_STORES}
          onSelectStore={(store) => setCenterRightView(store)}
        />

        <HomeModal 
          isOpen={isHomeModalOpen}
          onClose={() => setIsHomeModalOpen(false)}
        />
    </>
    );
  };

export default MainUhubFeatureV001ForMyProfileModal;
