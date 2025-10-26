import { MutableRefObject } from "react";
import Image from "next/image";
import { Upload, X, Camera } from "lucide-react";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
  id: string;
  label: string;
  labelExtra?: string;
  description: string;
  accept: string;
  preview: string | null;
  fileRef: MutableRefObject<File | null>;
  setPreview: (url: string | null) => void;
  handleFileUpload: (
    file: File | null,
    setPreview: (url: string | null) => void,
    fileRef: MutableRefObject<File | null>
  ) => void;
  required: boolean;
  icon?: "upload" | "camera";
  minHeight?: string;
}

const ImageUploader = ({
  id,
  label,
  labelExtra,
  description,
  accept,
  preview,
  fileRef,
  setPreview,
  handleFileUpload,
  required,
  icon = "upload",
  minHeight = "200px",
}: ImageUploaderProps) => {
  const IconComponent = icon === "camera" ? Camera : Upload;

  return (
    <div className="space-y-2">
      <Label>
        {label}{" "}
        {labelExtra && (
          <span className="text-muted-foreground">{labelExtra}</span>
        )}
      </Label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors relative flex flex-col items-center justify-center`}
        style={{ minHeight }}
        onClick={() => document.getElementById(id)?.click()}
      >
        {preview ? (
          <div className="relative w-full h-full" style={{ minHeight }}>
            <Image
              src={preview}
              alt={`Aperçu ${label}`}
              fill
              className="object-contain"
            />
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                fileRef.current = null;
                setPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <IconComponent className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Cliquez pour télécharger
            </p>
          </>
        )}
        <input
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleFileUpload(file, setPreview, fileRef);
          }}
        />
      </div>
      <div className="text-muted-foreground">{description}</div>
    </div>
  );
};

export default ImageUploader;
