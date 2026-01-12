import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Product {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  user_id?: number | null;
  store_id?: number | null;
  sku_id?: string | null;
  creator_username?: string;
  payment_url?: string | null;
}

interface EverythingProductsListProps {
  isLoading: boolean;
  onProductView: (product: Product) => void;
  getCartUrl: (product: Product | null) => string;
}

const EverythingProductsList: React.FC<EverythingProductsListProps> = ({
  isLoading,
  onProductView,
  getCartUrl,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingEverything, setLoadingEverything] = useState(false);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingEverything(true);
      try {
        // Fetch main store products (Union Store #0)
        const mainRes = await fetch('/api/products/store/0');
        const mainData = await mainRes.json();
        const mainProducts = Array.isArray(mainData) ? mainData : [];

        // Fetch all user products
        const userRes = await fetch('/api/products/user/0');
        const userData = await userRes.json();
        const userProducts = Array.isArray(userData) ? userData : [];

        // Fetch products from all stores #01-#30
        const storeProducts: Product[] = [];
        for (let storeNum = 1; storeNum <= 30; storeNum++) {
          try {
            const storeRes = await fetch(`/api/products/store/${storeNum}`);
            const storeData = await storeRes.json();
            if (Array.isArray(storeData)) {
              storeProducts.push(...storeData);
            }
          } catch (error) {
            console.error(`Error fetching products for store ${storeNum}:`, error);
          }
        }

        // Combine all products
        const combined = [...mainProducts, ...userProducts, ...storeProducts];

        // Shuffle to randomize order
        const shuffled = combined.sort(() => Math.random() - 0.5);

        setAllProducts(shuffled);
      } catch (error) {
        console.error('Error fetching all products:', error);
        setAllProducts([]);
      } finally {
        setLoadingEverything(false);
      }
    };

    fetchAllProducts();
  }, []);

  if (isLoading || loadingEverything) {
    return <div className="text-center text-muted-foreground py-4">Loading everything...</div>;
  }

  if (!allProducts || allProducts.length === 0) {
    return <div className="text-center text-muted-foreground py-4 text-sm">No products available</div>;
  }

  return (
    <div className="space-y-2">
      {allProducts.map((product) => (
        <div
          key={product.id}
          className="border rounded p-2 hover:bg-muted/50 transition cursor-pointer"
          onClick={() => onProductView(product)}
        >
          <p className="font-semibold text-sm truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {product.creator_username && `By: ${product.creator_username}`}
            {product.store_type === 'store' && ` • Store #${String(product.store_id).padStart(2, '0')}`}
            {product.store_type === 'main' && ' • Union Store #0'}
          </p>
          <div className="flex justify-between items-center mt-1">
            {product.price && <p className="text-xs font-semibold text-orange-400">${product.price.toFixed(2)}</p>}
            {product.payment_url && (
              <a href={product.payment_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ShoppingCart className="h-3 w-3" />
                </Button>
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EverythingProductsList;
