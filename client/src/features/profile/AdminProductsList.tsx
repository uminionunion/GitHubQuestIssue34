import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Eye, Trash2, Search } from 'lucide-react';

interface AdminProduct {
  id: number;
  name: string;
  price?: number | null;
  image_url: string | null;
  store_type: string;
  store_id?: number | null;
  username?: string | null;
  user_id?: number | null;
}

interface AdminProductsListProps {
  products: AdminProduct[];
  isLoading: boolean;
  onProductView: (product: AdminProduct) => void;
  onProductDelete: (productId: number) => Promise<void>;
}

export default function AdminProductsList({
  products,
  isLoading,
  onProductView,
  onProductDelete,
}: AdminProductsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'creator' | 'price'>('name');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'creator') {
        return (a.username || '').localeCompare(b.username || '');
      } else {
        return (a.price || 0) - (b.price || 0);
      }
    });

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setDeletingId(productId);
    try {
      await onProductDelete(productId);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center text-muted-foreground py-4">No products yet</div>;
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
          <option value="name">Sort: Name</option>
          <option value="creator">Sort: Creator</option>
          <option value="price">Sort: Price</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-3 py-2">Product Name</th>
              <th className="text-left px-3 py-2">Creator</th>
              <th className="text-left px-3 py-2">Price</th>
              <th className="text-left px-3 py-2">Store Type</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b hover:bg-muted/50 transition">
                <td className="px-3 py-2 font-medium">{product.name}</td>
                <td className="px-3 py-2">{product.username || 'System'}</td>
                <td className="px-3 py-2">
                  {product.price ? `$${product.price.toFixed(2)}` : '-'}
                </td>
                <td className="px-3 py-2 text-xs">
                  <span className="bg-muted px-2 py-1 rounded">
                    {product.store_type === 'main' ? 'Union' : product.store_type === 'store' ? `Store #${product.store_id}` : 'User'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex gap-2 justify-end">
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
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      title="Delete product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredProducts.length} of {products.length} products
      </div>
    </div>
  );
}
