import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../hooks/useAuth';

interface MainUhubFeatureV001ForAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MainUhubFeatureV001ForAddProductModal: React.FC<MainUhubFeatureV001ForAddProductModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [website, setWebsite] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('own_website');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [wooSku, setWooSku] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentOptions = [
    { value: 'own_website', label: 'Pay through my website' },
    { value: 'venmo', label: 'Venmo/CashApp' },
    { value: 'cash', label: 'Cash in person' },
    { value: 'card_coming_soon', label: 'Card (Coming Soon)' },
    { value: 'other', label: 'Other method' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validate required fields
    if (!title || !price || !image) {
      setError('Title, price, and image are required');
      return;
    }

    if (isNaN(parseFloat(price))) {
      setError('Price must be a valid number');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('payment_method', paymentMethod);
      formData.append('payment_url', paymentUrl);
      formData.append('website', website);
      formData.append('image', image);
      
      // Only include WooCommerce SKU if user is admin
      if (user?.is_high_high_high_admin === 1 && wooSku) {
        formData.append('woo_sku', wooSku);
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create product');
        return;
      }

      // Success - close modal and refresh
      console.log('Product created successfully');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error creating product:', error);
      setError('An error occurred while creating the product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex p-0">
        <div className="w-1/2 p-6 flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add a New Product</DialogTitle>
            <DialogDescription>Fill in the details for your new product.</DialogDescription>
          </DialogHeader>

          <div className="flex-grow space-y-4 pr-2">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="title">Title (max 100 chars) *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Product name"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subheader (max 300 chars)</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={300}
                placeholder="Short description"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (max 1000 chars)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Detailed description"
              />
            </div>

            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="website">Website / Product Link</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="payment-method">Payment Method *</Label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {paymentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {(paymentMethod === 'venmo' || paymentMethod === 'cash' || paymentMethod === 'other') && (
              <div>
                <Label htmlFor="payment-url">Payment Details / Contact Info</Label>
                <Input
                  id="payment-url"
                  value={paymentUrl}
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  placeholder="e.g., @venmoUsername or cash payment location"
                />
              </div>
            )}

            {paymentMethod === 'own_website' && (
              <div>
                <Label htmlFor="payment-url">Website Payment URL</Label>
                <Input
                  id="payment-url"
                  value={paymentUrl}
                  onChange={(e) => setPaymentUrl(e.target.value)}
                  placeholder="https://example.com/checkout"
                />
              </div>
            )}

            {user?.is_high_high_high_admin === 1 && (
              <div>
                <Label htmlFor="woo-sku">WooCommerce SKU (Admin Only)</Label>
                <Input
                  id="woo-sku"
                  value={wooSku}
                  onChange={(e) => setWooSku(e.target.value)}
                  placeholder="e.g., TAPESTRY-001"
                />
                <p className="text-xs text-gray-500 mt-1">Links product to WooCommerce inventory</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !title || !price || !image}
            >
              {isLoading ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </div>

        <div className="w-1/2 p-6 border-l bg-muted/40 flex flex-col items-center justify-center">
          <DialogHeader className="mb-4">
            <DialogTitle>Upload Product Image</DialogTitle>
          </DialogHeader>
          <div className="w-full h-64 border-2 border-dashed border-border rounded-md flex items-center justify-center mb-4 bg-white">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Product preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-muted-foreground text-center px-4">No image selected. Click below to upload.</p>
            )}
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="cursor-pointer"
          />
          {image && (
            <p className="text-xs text-muted-foreground mt-2">{image.name}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainUhubFeatureV001ForAddProductModal;