import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  userStores: any[];
  onProductUpdated?: () => void;
}

const MainUhubFeatureV001ForEditProductModal: React.FC<MainUhubFeatureV001ForEditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  userStores,
  onProductUpdated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedUserStore, setSelectedUserStore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product && isOpen) {
      setTitle(product.name || '');
      setSubtitle(product.subtitle || '');
      setDescription(product.description || '');
      setPrice(product.price ? String(product.price) : '');
      setSelectedUserStore(product.user_store_id || null);
      setError('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product || !user) return null;

  const handleAssignToUserStore = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedUserStore) {
    setError('Please select a user store');
    return;
  }

  if (!product || !product.id) {
    setError('Product data is missing');
    return;
  }

  setIsSubmitting(true);
  setError('');
  
  try {
    console.log(`[EDIT PRODUCT] Assigning product ${product.id} to user store ${selectedUserStore}`);
    
    const response = await fetch(`/api/products/${product.id}/user-store`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userStoreId: selectedUserStore }),
    });

    console.log(`[EDIT PRODUCT] Response status: ${response.status}`);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Server error: ${response.status} ${response.statusText}`;
      
      if (contentType?.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('[EDIT PRODUCT] Failed to parse error response:', parseError);
        }
      }
      
      console.error('[EDIT PRODUCT] Request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`[EDIT PRODUCT] ✅ Success:`, data);
    
    setError('');
    if (onProductUpdated) {
      onProductUpdated();
    }
    
    onClose();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to assign product to store';
    console.error('[EDIT PRODUCT] ❌ Error assigning product to store:', errorMsg);
    setError(errorMsg);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[30000]">
      <div className="bg-background border rounded-lg p-6 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Product</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAssignToUserStore} className="space-y-4">
          {/* Display-only fields */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-sm mb-3">Current Product Details (Read-only)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Name</label>
                <p className="font-semibold text-white">{title}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Subtitle</label>
                <p className="text-gray-200">{subtitle || 'No subtitle'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Description</label>
                <p className="text-gray-200 text-sm">{description || 'No description'}</p>
              </div>
              <div>
                <label className="text-xs text-gray-400">Price</label>
                <p className="font-semibold text-orange-400">${Number(price).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* User Store Selection */}
          <div>
            <label className="block font-semibold mb-2">Add to Your Store</label>
            <p className="text-xs text-gray-400 mb-2">Select which of your custom stores to add this product to:</p>
            
            {userStores.length === 0 ? (
              <div className="p-3 bg-gray-800 rounded border border-gray-700 text-gray-300 text-sm">
                You haven't created any custom stores yet. Create one in the Settings or Home section.
              </div>
            ) : (
              <select
                value={selectedUserStore || ''}
                onChange={(e) => setSelectedUserStore(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full border rounded px-3 py-2 bg-gray-900 border-gray-700 text-white"
              >
                <option value="">-- Select a store --</option>
                {userStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Current Assignment */}
          {product.user_store_id && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-sm">
              Currently assigned to: <strong>{userStores.find(s => s.id === product.user_store_id)?.name || 'Unknown Store'}</strong>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !selectedUserStore}
              className="bg-orange-400 hover:bg-orange-500 flex-1"
            >
              {isSubmitting ? 'Assigning...' : 'Assign to Store'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForEditProductModal;
