import React from 'react';
import { Button } from '../../components/ui/button';
import { Eye, Trash2 } from 'lucide-react';

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
}

interface AdminProductsListProps {
  products: Product[];
  isLoading: boolean;
  onProductView: (product: Product) => void;
  onProductDelete: (productId: number) => void;
}

const AdminProductsList: React.FC<AdminProductsListProps> = ({
  products,
  isLoading,
  onProductView,
  onProductDelete,
}) => {
  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-4 text-sm">No products available</div>;
  }

  // Sort alphabetically by name
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-2">
      {sortedProducts.map((product) => (
        <div key={product.id} className="border rounded p-3 flex items-center justify-between gap-2 hover:bg-muted/50 transition">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              By: {product.creator_username || 'Unknown'}
              {product.store_type === 'store' && ` (Store #${String(product.store_id).padStart(2, '0')})`}
              {product.store_type === 'main' && ' (Union Store #0)'}
            </p>
            {product.price && (
              <p className="text-xs font-semibold text-orange-400">${product.price.toFixed(2)}</p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onProductView(product)}
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
              onClick={() => {
                if (confirm(`Delete "${product.name}"?`)) {
                  onProductDelete(product.id);
                }
              }}
              title="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminProductsList;
