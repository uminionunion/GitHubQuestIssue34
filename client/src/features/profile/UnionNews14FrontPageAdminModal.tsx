import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { X } from 'lucide-react';

interface UnionNews14Image {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  clickUrl?: string;
}

interface UnionNews14FrontPageAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageAdded: (image: UnionNews14Image) => void;
}

const UnionNews14FrontPageAdminModal: React.FC<UnionNews14FrontPageAdminModalProps> = ({
  isOpen,
  onClose,
  onImageAdded,
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Please upload a JPG, JPEG, or PNG image');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('clickUrl', clickUrl);

      const response = await fetch('/api/broadcasts/union-news-14/images/add', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add image');
      }

      const data = await response.json();
      onImageAdded(data.image);

      // Reset form
      setImageFile(null);
      setImagePreview('');
      setTitle('');
      setDescription('');
      setClickUrl('');
      onClose();

      alert('Image added successfully!');
    } catch (error) {
      console.error('[UnionNews14] Error adding image:', error);
      alert('Failed to add image: ' + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100002]">
      <div className="bg-background border rounded-lg p-6 max-w-md w-[95%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Image to UnionNews#14</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Image (JPG, JPEG, PNG)</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageSelect}
              className="w-full p-2 border rounded bg-gray-800 text-white"
            />
            {imagePreview && (
              <div className="mt-2 h-40 rounded overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Title (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Image title"
              className="w-full p-2 border rounded bg-gray-800 text-white"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Image description"
              className="w-full p-2 border rounded bg-gray-800 text-white resize-none"
              rows={3}
            />
          </div>

          {/* URL (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">URL to Open (Optional)</label>
            <input
              type="text"
              value={clickUrl}
              onChange={(e) => setClickUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border rounded bg-gray-800 text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white"
              onClick={handleSubmit}
              disabled={isSubmitting || !imageFile}
            >
              {isSubmitting ? 'Adding...' : 'Add Image'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnionNews14FrontPageAdminModal;
