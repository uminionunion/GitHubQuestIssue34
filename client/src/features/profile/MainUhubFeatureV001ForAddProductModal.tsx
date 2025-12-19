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
  onProductAdded?: () => void;
}

const MainUhubFeatureV001ForAddProductModal: React.FC<MainUhubFeatureV001ForAddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || price === '') {
      setError('Title and price are required');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('payment_url', paymentUrl);
      formData.append('payment_method', paymentMethod);
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

      setTitle('');
      setSubtitle('');
      setDescription('');
      setPrice('');
      setPaymentUrl('');
      setPaymentMethod('');
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex p-0">
        {/* Left Panel: Form */}
        <div className="w-1/2 p-6 flex flex-col">
          <DialogHeader>
            <DialogTitle>Add a New Product to Your Store</DialogTitle>
            <DialogDescription>Fill in the details for your new product.</DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex-grow overflow-y-auto space-y-4 pr-2">
            <div>
              <Label htmlFor="title">Product Name (required)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="e.g., Vintage Leather Jacket"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                maxLength={300}
                placeholder="e.g., High quality, authentic"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Describe your product in detail..."
              />
            </div>
            <div>
              <Label htmlFor="price">Price (required)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="e.g., Cash, PayPal, Venmo"
              />
            </div>
            <div>
              <Label htmlFor="paymentUrl">Payment URL / Link</Label>
              <Input
                id="paymentUrl"
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title || price === ''}
              className="bg-orange-400 hover:bg-orange-500"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </div>

        {/* Right Panel: Image Upload */}
        <div className="w-1/2 p-6 border-l bg-muted/40 flex flex-col items-center justify-center">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-base">Product Image</DialogTitle>
          </DialogHeader>
          <div className="w-full h-64 border-2 border-dashed border-border rounded-md flex items-center justify-center mb-4">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="Product preview" className="max-h-full max-w-full" />
            ) : (
              <p className="text-muted-foreground text-center px-4">Upload a product image</p>
            )}
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MainUhubFeatureV001ForAddProductModal;
