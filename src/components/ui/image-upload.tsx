import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string | File | null; // ✅ can be string URL or File
  onChange: (fileOrUrl: File | string | null) => void;
  bucket: string;
  className?: string;
  accept?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket,
  className,
  accept = "image/*",
  placeholder = "Upload an image",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Safely set preview URL when value changes
  useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return;
    }

    if (typeof value === "string") {
      // If it's a string, use directly
      setPreviewUrl(value);
    } else if (value instanceof File) {
      // If it's a File, create an object URL
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    setPreviewUrl(URL.createObjectURL(file));
    onChange(file); // return File
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlInput = (url: string) => {
    setPreviewUrl(url);
    onChange(url); // return string
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        {previewUrl ? (
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="h-32 w-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {placeholder}
          </Button>
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div>
          <Label className="text-xs text-muted-foreground">
            Or enter image URL:
          </Label>
          <Input
            type="url"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => handleUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}