import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { ShoppingCart, Search, Eye } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  store_id?: number | null;
  username?: string | null;
  payment_url?: string | null;
  url?: string | null;
}

interface EverythingProductsListProps {
  isLoading: boolean;
  onProductView: (product: Product) => void;
  getCartUrl: (product: Product | null) => string;
}

export default function EverythingProductsList({
  isLoading,
  onProductView,
  getCartUrl,
}: EverythingProductsListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'random' | 'name' | 'price'>('random');

  useEffect(() => {
    const fetchEverythingProducts = async () => {
      try {
        const response = await fetch('/api/products/all/everything');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
        console.log('[EVERYTHING] Loaded products:', data);
      } catch (error) {
        console.error('Error fetching everything products:', error);
        setProducts([]);
      }
    };

    fetchEverythingProducts();
  }, []);

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice() // Create copy for sorting
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        return (a.price || 0) - (b.price || 0);
      }
      // 'random' - keep original shuffled order
      return 0;
    });

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products available yet</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border rounded-md bg-background text-foreground text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded-md bg-background text-foreground text-sm"
        >
          <option value="random">Sort: Random</option>
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-3 hover:bg-muted/50 transition flex gap-3 items-start"
          >
            {/* Product Image */}
            {product.image_url && (
              <div
                className="w-20 h-20 flex-shrink-0 bg-cover bg-center rounded-md border cursor-pointer"
                style={{ backgroundImage: `url('${product.image_url}')` }}
                onClick={() => onProductView(product)}
                title="View details"
              />
            )}

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{product.name}</h4>
              <p className="text-xs text-muted-foreground">
                By: {product.username || 'System'}
              </p>
              <p className="text-xs text-muted-foreground">
                Type: {product.store_type === 'main' ? 'Union' : product.store_type === 'store' ? `Store #${product.store_id}` : 'User'}
              </p>
              {product.price && (
                <p className="text-sm font-bold text-orange-400 mt-1">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onProductView(product)}
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <a href={getCartUrl(product)} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-orange-400 hover:bg-orange-500 text-white"
                  title="Add to cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredProducts.length} of {products.length} products from all sources
      </div>
    </div>
  );
}
