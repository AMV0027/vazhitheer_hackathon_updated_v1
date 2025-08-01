import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SingleImageManager = ({
  image = null,
  onImageChange,
  title = "Collection Image",
  onDeleteImage = null,
  itemId = null
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      onImageChange(file);
    }
  }, [onImageChange]);

  const removeImage = useCallback(async () => {
    // If it's a URL (existing image), delete from bucket
    if (typeof image === 'string' && onDeleteImage && itemId) {
      setDeletingImage(true);
      try {
        await onDeleteImage(itemId);
      } catch (error) {
        console.error('Error deleting image from bucket:', error);
      } finally {
        setDeletingImage(false);
      }
    }
    
    onImageChange(null);
  }, [image, onImageChange, onDeleteImage, itemId]);

  const openPreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image; // Already a URL
    }
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return null;
  };

  const imageUrl = getImageUrl(image);
  const isExistingImage = typeof image === 'string';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        {image && (
          <span className="text-sm text-muted-foreground">
            {isExistingImage ? 'Saved' : 'New upload'}
          </span>
        )}
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          id="single-image-upload"
          className="hidden"
          onChange={handleImageUpload}
          disabled={deletingImage}
        />
        <label htmlFor="single-image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {deletingImage ? 'Deleting...' : 'Click to upload image'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Image Display */}
      {imageUrl && (
        <div className="relative group aspect-square max-w-xs">
          <img
            src={imageUrl}
            alt="Collection image"
            className="w-full h-full object-cover rounded-lg cursor-pointer"
            onClick={openPreview}
          />

          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={openPreview}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={removeImage}
                disabled={deletingImage}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Existing image indicator */}
          {isExistingImage && (
            <div className="absolute top-2 right-2 bg-blue-500 bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              Saved
            </div>
          )}
        </div>
      )}

      {/* Full Screen Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(open) => {
        if (!open) {
          closePreview();
        }
      }}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Image Preview</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-0">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={imageUrl}
                alt="Collection image"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isExistingImage && (
                <span className="text-blue-500">(Saved)</span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SingleImageManager; 