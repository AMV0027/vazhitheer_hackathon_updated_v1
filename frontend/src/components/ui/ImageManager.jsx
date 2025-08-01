import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Eye, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ImageManager = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  title = "Product Images",
  onDeleteImages = null, // Callback for deleting images from bucket
  productId = null // Product ID for bucket deletion
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deletingImages, setDeletingImages] = useState(false);

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];

    if (newImages.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    onImagesChange(newImages);
  }, [images, maxImages, onImagesChange]);

  const removeImage = useCallback(async (index) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);

    // If it's a URL (existing image), delete from bucket
    if (typeof imageToRemove === 'string' && onDeleteImages && productId) {
      setDeletingImages(true);
      try {
        await onDeleteImages(productId, [imageToRemove]);
      } catch (error) {
        console.error('Error deleting image from bucket:', error);
        // Optionally show error message to user
      } finally {
        setDeletingImages(false);
      }
    }

    onImagesChange(newImages);
  }, [images, onImagesChange, onDeleteImages, productId]);

  const openPreview = useCallback((image, index) => {
    setPreviewImage({ image, index });
    setPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewImage(null);
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

  // Separate existing images (URLs) from new files
  const existingImages = images.filter(img => typeof img === 'string');
  const newFiles = images.filter(img => img instanceof File);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          multiple
          id="image-upload"
          className="hidden"
          onChange={handleImageUpload}
          disabled={images.length >= maxImages || deletingImages}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {images.length >= maxImages ? 'Maximum images reached' : deletingImages ? 'Deleting...' : 'Click to upload images'}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const imageUrl = getImageUrl(image);
            if (!imageUrl) return null;

            const isExistingImage = typeof image === 'string';

            return (
              <div key={index} className="relative group aspect-square">
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPreview(image, index);
                  }}
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openPreview(image, index);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      disabled={deletingImages}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Image number badge */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>

                {/* Existing image indicator */}
                {isExistingImage && (
                  <div className="absolute top-2 right-2 bg-blue-500 bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Saved
                  </div>
                )}
              </div>
            );
          })}
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

          {previewImage && (
            <div className="p-6 pt-0">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={getImageUrl(previewImage.image)}
                  alt={`Image ${previewImage.index + 1}`}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />

                {/* Navigation buttons */}
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newIndex = previewImage.index > 0 ? previewImage.index - 1 : images.length - 1;
                      setPreviewImage({ image: images[newIndex], index: newIndex });
                    }}
                    disabled={images.length <= 1}
                  >
                    <span className="text-lg">‹</span>
                  </Button>
                </div>

                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newIndex = previewImage.index < images.length - 1 ? previewImage.index + 1 : 0;
                      setPreviewImage({ image: images[newIndex], index: newIndex });
                    }}
                    disabled={images.length <= 1}
                  >
                    <span className="text-lg">›</span>
                  </Button>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Image {previewImage.index + 1} of {images.length}
                {typeof previewImage.image === 'string' && (
                  <span className="ml-2 text-blue-500">(Saved)</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageManager; 