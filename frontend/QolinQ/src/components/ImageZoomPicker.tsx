import { useState, useRef, useEffect } from "react";
import { X, RotateCcw, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import NeonButton from "@/components/NeonButton";
import { toast } from "sonner";

interface ImageZoomPickerProps {
  onImageSelect: (croppedImage: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  previewSize?: number; // Size of the preview frame in pixels (default 200)
  initialSource?: string | null; // Pre-load an image directly into the editor
}

export const ImageZoomPicker = ({
  onImageSelect,
  onCancel,
  isOpen,
  previewSize = 200,
  initialSource,
}: ImageZoomPickerProps) => {
  const [imageSource, setImageSource] = useState<string | null>(initialSource ?? null);
  const [zoom, setZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialSource) {
      setImageSource(initialSource);
      setZoom(100);
      setOffsetX(0);
      setOffsetY(0);
    }
    if (!isOpen) {
      setImageSource(null);
    }
  }, [isOpen, initialSource]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSource(event.target?.result as string);
      setZoom(100);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.onerror = () => {
      toast.error("Could not read the file. Try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Clamp the offset values to allow reasonable panning
    const maxOffset = (zoom - 100) * 2;
    setOffsetX(Math.max(-maxOffset, Math.min(maxOffset, newX)));
    setOffsetY(Math.max(-maxOffset, Math.min(maxOffset, newY)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoom = () => {
    setZoom(100);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleConfirm = () => {
    if (!canvasRef.current || !imageSource) {
      toast.error("Please select and adjust an image first");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      toast.error("Could not process image");
      return;
    }

    // Create an image element
    const img = new Image();
    img.onload = () => {
      canvas.width = previewSize;
      canvas.height = previewSize;

      // Calculate the scaled and offset position
      const scaleFactor = (zoom / 100) * (previewSize / Math.max(img.width, img.height)) * 1.1;

      ctx.drawImage(
        img,
        offsetX * 0.5,
        offsetY * 0.5,
        previewSize / scaleFactor,
        previewSize / scaleFactor,
        0,
        0,
        previewSize,
        previewSize
      );

      const croppedImage = canvas.toDataURL("image/jpeg", 0.95);
      onImageSelect(croppedImage);
      setImageSource(null);
      toast.success("Profile picture updated!");
    };
    img.src = imageSource;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-card border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {imageSource ? "Adjust Your Image" : "Upload Profile Picture"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {imageSource
                  ? "Use the slider to zoom and drag to position your image"
                  : "Select an image to get started"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!imageSource ? (
            /* File Upload Section */
            <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors cursor-pointer">
              <label className="flex flex-col items-center gap-3 cursor-pointer">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          ) : (
            /* Image Editor Section */
            <div className="space-y-6">
              {/* Preview Frame */}
              <div className="flex flex-col items-center gap-4">
                <Label className="text-sm font-semibold">Preview</Label>
                <div
                  ref={previewRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="border-2 border-primary rounded-lg overflow-hidden bg-muted cursor-move select-none"
                  style={{
                    width: `${previewSize}px`,
                    height: `${previewSize}px`,
                  }}
                >
                  {imageSource && (
                    <div
                      style={{
                        transform: `scale(${zoom / 100}) translate(${offsetX}px, ${offsetY}px)`,
                        transformOrigin: "center",
                        transition: isDragging ? "none" : "transform 0.2s ease-out",
                      }}
                    >
                      <img
                        src={imageSource}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        draggable="false"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Drag to position • Zoom: {zoom}%
                </p>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Zoom Level</Label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-8">100%</span>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-xs text-muted-foreground w-12">
                    {zoom}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetZoom}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-accent hover:bg-accent/80 rounded-lg transition-colors text-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Canvas Hidden */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <NeonButton
                  neonVariant="secondary"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </NeonButton>
                <NeonButton
                  neonVariant="primary"
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  Use This Image
                </NeonButton>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
