import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: number; // For HIGH-HIGH ADMIN - pre-selected store
}

const MainUhubFeatureV001ForAddProductModal: React.FC<MainUhubFeatureV001ForAddProductModalProps> = ({ 
  isOpen, 
  onClose,
  storeId: preSelectedStoreId
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('own_website');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [wooSku, setWooSku] = useState('');
  const [storeId, setStoreId] = useState(String(preSelectedStoreId || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const isHighHighHighAdmin = user.is_high_high_high_admin === 1;
  const isHighHighAdmin = user.is_high_high_admin === 1;

  const paymentOptions = [
    { value: 'own_website', label: 'Pay through my website' },
    { value: 'venmo', label: 'Venmo/CashApp' },
    { value: 'cash', label: 'Cash in person' },
    { value: 'card_coming_soon', label: 'Card (Coming Soon)' },
    { value: 'other', label: 'Other method' }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !image || !price) {
      setError('Please fill in title, image, and price');
      return;
    }

    if (isHighHighAdmin && (!storeId || parseInt(storeId) < 1 || parseInt(storeId) > 30)) {
      setError('Please select a valid store (01-30)');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('payment_method', paymentMethod);
      formData.append('payment_url', paymentUrl);
      formData.append('image', image);
      
      if (isHighHighHighAdmin) {
        formData.append('woo_sku', wooSku);
      }
      if (isHighHighAdmin) {
        formData.append('store_id', storeId);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        setTitle('');
        setSubtitle('');
        setDescription('');
        setPrice('');
        setImage(null);
        setPaymentMethod('own_website');
        setPaymentUrl('');
        setWooSku('');
        setStoreId(String(preSelectedStoreId || ''));
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setError('An error occurred while creating the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000]">
      <div className="bg-background border rounded-lg p-6 max-w-2xl w-[90%] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Product</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900 bg-opacity-20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Product Name *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subtitle</label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Optional subtitle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price *</label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image *</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                  required
                />
                {image && <span className="text-xs text-green-400">✓</span>}
              </div>
            </div>
          </div>

          {isHighHighHighAdmin && (
            <div>
              <label className="block text-sm font-medium mb-2">WooCommerce SKU</label>
              <Input
                value={wooSku}
                onChange={(e) => setWooSku(e.target.value)}
                placeholder="e.g., TAPESTRY-001"
              />
              <p className="text-xs text-muted-foreground mt-1">Links to WooCommerce product at page001.uminion.com</p>
            </div>
          )}

          {isHighHighAdmin && (
            <div>
              <label className="block text-sm font-medium mb-2">Store Number *</label>
              <Input
                type="number"
                min="1"
                max="30"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                placeholder="Enter store number (1-30)"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border rounded bg-background text-foreground"
            >
              {paymentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {paymentMethod !== 'cash' && paymentMethod !== 'card_coming_soon' && (
            <div>
              <label className="block text-sm font-medium mb-2">Payment URL</label>
              <Input
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground mt-1">Link to your website, Venmo, etc.</p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-400 hover:bg-orange-500 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForAddProductModal;
