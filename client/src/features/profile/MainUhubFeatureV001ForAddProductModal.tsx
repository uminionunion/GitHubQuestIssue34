import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: () => void;
}

const MainUhubFeatureV001ForAddProductModal: React.FC<MainUhubFeatureV001ForAddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [wooSku, setWooSku] = useState('');
  const [storeId, setStoreId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  // Determine user's role and available stores
  const isHighHighHighAdmin = user.is_high_high_high_admin === 1;
  const isHighHighAdmin = user.is_high_high_admin === 1;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setQrCodeImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || price === '') {
      setError('Title and price are required');
      return;
    }

    if (!paymentMethod) {
      setError('Payment method is required');
      return;
    }

    if (paymentMethod === 'venmo_cashapp' && !qrCodeImage) {
      setError('QR code image is required for Venmo/CashApp option');
      return;
    }

    if (paymentMethod === 'through_site' && !websiteUrl) {
      setError('Website URL is required for "Through Site" option');
      return;
    }

    // Check if store selection is required for admins
    if ((isHighHighHighAdmin || isHighHighAdmin) && !storeId) {
      setError('Store selection is required');
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

      // Add payment data based on method
      if (paymentMethod === 'venmo_cashapp' && qrCodeImage) {
        formData.append('qr_code_image', qrCodeImage);
      } else if (paymentMethod === 'through_site' && websiteUrl) {
        formData.append('payment_url', websiteUrl);
      }

      if (isHighHighHighAdmin && wooSku) {
        formData.append('sku_id', wooSku);
      }

      // Both HIGH-HIGH-HIGH and HIGH-HIGH admins can select stores
      if ((isHighHighHighAdmin || isHighHighAdmin) && storeId) {
        formData.append('store_id', storeId);
      }

      if (image) {
        formData.append('image', image);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      // Reset form
      setTitle('');
      setSubtitle('');
      setDescription('');
      setPrice('');
      setPaymentMethod('');
      setQrCodeImage(null);
      setWebsiteUrl('');
      setWooSku('');
      setStoreId('');
      setImage(null);

      if (onProductAdded) {
        onProductAdded();
      }

      onClose();
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
      <div className="bg-background border rounded-lg p-6 max-w-2xl w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add a New Product to Your Store</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">Product Name (required)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g., Vintage Leather Jacket"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Subtitle</label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              maxLength={300}
              placeholder="e.g., High quality, authentic"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Describe your product in detail..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Price (required)</label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          {isHighHighHighAdmin && (
            <div>
              <label className="block font-semibold mb-2">SKU ID</label>
              <Input
                value={wooSku}
                onChange={(e) => setWooSku(e.target.value)}
                placeholder="SKU code (optional)"
              />
            </div>
          )}

          {(isHighHighHighAdmin || isHighHighAdmin) && (
  <div>
    <label className="block font-semibold mb-2">Store Number (required)</label>
    <select
      value={storeId}
      onChange={(e) => setStoreId(e.target.value)}
      className="w-full border rounded px-3 py-2 bg-background"
      required
    >
      <option value="">Select a store...</option>
      <option value="0">Show in Union Store</option>
      {Array.from({ length: 30 }, (_, i) => (
        <option key={i + 1} value={String(i + 1)}>
          Store #{String(i + 1).padStart(2, '0')}
        </option>
      ))}
    </select>
  </div>
)}

          <div>
            <label className="block font-semibold mb-2">Payment Method</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Cash</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="venmo_cashapp"
                  checked={paymentMethod === 'venmo_cashapp'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Venmo/CashApp/OtherApp</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer opacity-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="through_union"
                  disabled
                  className="w-4 h-4"
                />
                <span>Through the Union (Coming Soon)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="through_site"
                  checked={paymentMethod === 'through_site'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Through Site</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'venmo_cashapp' && (
            <div>
              <label className="block font-semibold mb-2">Venmo/CashApp QR Code</label>
              <div className="border-2 border-dashed border-border rounded p-4 text-center mb-3">
                {qrCodeImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={URL.createObjectURL(qrCodeImage)} alt="QR Code Preview" className="max-h-32 max-w-full" />
                    <button
                      type="button"
                      onClick={() => setQrCodeImage(null)}
                      className="text-xs text-orange-400 hover:underline"
                    >
                      Remove QR code
                    </button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No QR code selected</p>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleQrCodeChange}
              />
            </div>
          )}

          {paymentMethod === 'through_site' && (
            <div>
              <label className="block font-semibold mb-2">Website URL</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com/product"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Product Image</label>
            <div className="border-2 border-dashed border-border rounded p-4 text-center mb-3">
              {image ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-32 max-w-full" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-xs text-orange-400 hover:underline"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground">Upload a product image</p>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !title || price === '' || !paymentMethod}
              className="bg-orange-400 hover:bg-orange-500 flex-1"
            >
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MainUhubFeatureV001ForAddProductModal;
