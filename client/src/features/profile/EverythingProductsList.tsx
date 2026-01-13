import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Search, ShoppingCart, Plus, Minus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number;
  store_id?: number;
  sku_id?: string;
}

interface EverythingProductsListProps {
  products: Product[];
  isLoading: boolean;
  onProductView: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const EverythingProductsList: React.FC<EverythingProductsListProps> = ({ 
  products = [], 
  isLoading,
  onProductView,
  onAddToCart
}) => {
  const [inCart, setInCart] = useState<{ [key: number]: boolean }>({});

  const handleCartClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setInCart(prev => ({ ...prev, [product.id]: !prev[product.id] }));
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products available</div>;
  }

  // Shuffle products randomly
  const shuffledProducts = [...products].sort(() => Math.random() - 0.5);

  return (
    <div className="grid grid-cols-2 gap-2">
      {shuffledProducts.map((product) => (
        <div 
          key={product.id}
          className="border rounded-md p-2 cursor-pointer hover:border-orange-400 transition relative h-32 group"
          onClick={() => onProductView(product)}
        >
          {/* Product Image */}
          <div 
            className="h-full bg-cover bg-center rounded mb-2"
            style={{ 
              backgroundImage: product.image_url ? `url('${product.image_url}')` : 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)'
            }}
          />
          
          {/* Product Info Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition flex flex-col justify-between p-2 rounded">
            <div className="opacity-0 group-hover:opacity-100 transition text-white text-xs">
              <p className="font-semibold truncate">{product.name}</p>
              {product.price && <p className="text-orange-400">${product.price.toFixed(2)}</p>}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-white hover:text-orange-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onProductView(product);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
              {onAddToCart && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 text-white hover:text-orange-400"
                  onClick={(e) => handleCartClick(e, product)}
                >
                  {inCart[product.id] ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EverythingProductsList;
