import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { ShoppingCart, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface Product {
  id: number;
  name: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  price: number;
  payment_method: string;
  payment_url?: string;
  woo_commerce_sku?: string;
  store_type: string;
  user_id?: number;
}

interface MainUhubFeatureV001ForProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const PaymentMethodDisplay = ({ method, url }: { method: string; url?: string }) => {
  const methods: Record<string, { icon: string; text: string; color: string }> = {
    own_website: {
      icon: '🌐',
      text: 'Available on seller\'s website',
      color: 'bg-blue-50'
    },
    venmo: {
      icon: '💳',
      text: 'Venmo/CashApp available',
      color: 'bg-cyan-50'
    },
    cash: {
      icon: '💵',
      text: 'Cash payment accepted',
      color: 'bg-green-50'
    },
    card_coming_soon: {
      icon: '🔒',
      text: 'Card payments coming soon',
      color: 'bg-purple-50'
    },
    other: {
      icon: '❓',
      text: 'Contact seller for payment options',
      color: 'bg-gray-50'
    }
  };

  const info = methods[method] || methods.other;

  return (
    <div className={`border rounded-lg p-4 mt-4 ${info.color}`}>
      <h4 className="font-bold mb-3">Payment Method</h4>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{info.icon}</span>
        <span className="text-sm font-medium">{info.text}</span>
      </div>
      {url && method === 'own_website' && (
        <p className="text-xs text-gray-600 mb-3">
          Link: <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {url}
          </a>
        </p>
      )}
      {url && (method === 'venmo' || method === 'cash' || method === 'other') && (
        <p className="text-xs text-gray-600 mb-3">
          Contact: <span className="font-mono">{url}</span>
        </p>
      )}
    </div>
  );
};

const MainUhubFeatureV001ForProductDetailModal: React.FC<MainUhubFeatureV001ForProductDetailModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { user } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (!product) return null;

  const handleWooCommerceAddToCart = (product: Product) => {
    if (product.woo_commerce_sku) {
      window.open(
        `https://page001.uminion.com/cart/?add-to-cart=${product.woo_commerce_sku}`,
        '_blank'
      );
    } else {
      window.open('https://page001.uminion.com/cart/', '_blank');
    }
  };

  const handleAddToInternalCart = async () => {
    if (!user) {
      alert('You must be logged in to add to cart');
      return;
    }

    if (product.store_type !== 'user') {
      alert('Only user products can be added to internal cart');
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/products/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      if (response.ok) {
        alert('Added to your "Where to Buy" cart');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('An error occurred');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSendMessage = () => {
    alert('Direct messaging feature coming soon!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex p-0">
        {/* Left Side - Image */}
        <div className="w-1/2 bg-black flex items-center justify-center overflow-hidden p-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Right Side - Details */}
        <div className="w-1/2 p-8 flex flex-col overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-3xl font-bold">{product.name}</DialogTitle>
            {product.subtitle && (
              <DialogDescription className="text-lg text-muted-foreground mt-2">
                {product.subtitle}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Description */}
          <div className="flex-grow my-6">
            <p className="text-sm leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Price and Cart Buttons */}
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <span className="text-3xl font-bold text-orange-500">
                ${product.price?.toFixed(2) || '0.00'}
              </span>
            </div>

            {/* Payment Method Display */}
            <PaymentMethodDisplay
              method={product.payment_method || 'own_website'}
              url={product.payment_url}
            />

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              {product.store_type === 'main' ? (
                <Button
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleWooCommerceAddToCart(product)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to WooCommerce Cart
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleAddToInternalCart}
                    disabled={isAddingToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isAddingToCart ? 'Adding...' : 'Add to "Where to Buy" Cart'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={handleSendMessage}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Message Seller
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainUhubFeatureV001ForProductDetailModal;