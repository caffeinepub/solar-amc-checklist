import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, ImagePlus, Loader2, RotateCcw, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../camera/useCamera";
import {
  type PhotoEntry,
  combineNotesAndPhotos,
  parseNotesAndPhotos,
} from "../lib/photoStorage";

interface PhotoAttachmentsProps {
  /** The full combined notes+photos string from the parent. */
  combinedNotes: string;
  /** Called whenever photos change; parent should update its notes state. */
  onNotesChange: (newCombined: string) => void;
}

async function compressImage(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_DIM = 1024;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}

function CameraPermissionDialog({
  onAllow,
  onDeny,
}: {
  onAllow: () => void;
  onDeny: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-1">
            <Camera className="w-7 h-7 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Allow Camera Access
          </h2>
          <p className="text-sm text-gray-500">
            This app needs access to your camera to take photos for the report.
            Your browser will ask for permission when you proceed.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onAllow}
          >
            Allow Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onDeny}
          >
            Deny
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PhotoAttachments({
  combinedNotes,
  onNotesChange,
}: PhotoAttachmentsProps) {
  const { notes, photos: entries } = parseNotesAndPhotos(combinedNotes);

  const [compressing, setCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateEntries = (newEntries: PhotoEntry[]) => {
    onNotesChange(combineNotesAndPhotos(notes, newEntries));
  };

  const {
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    videoRef,
    canvasRef,
    isSupported,
  } = useCamera({ facingMode: "environment", quality: 0.85 });

  const startCameraRef = useRef(startCamera);
  startCameraRef.current = startCamera;
  const stopCameraRef = useRef(stopCamera);
  stopCameraRef.current = stopCamera;

  useEffect(() => {
    if (showCamera) {
      startCameraRef.current();
    } else {
      stopCameraRef.current();
    }
  }, [showCamera]);

  const addPhoto = async (file: File | Blob) => {
    setCompressing(true);
    setCompressProgress(10);
    try {
      const dataUrl = await compressImage(file);
      setCompressProgress(100);
      updateEntries([...entries, { dataUrl, label: "" }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to process photo: ${msg}`);
    } finally {
      setCompressing(false);
      setCompressProgress(0);
    }
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    setShowCamera(false);
    await addPhoto(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";
    setCompressing(true);
    setCompressProgress(0);
    try {
      const newEntries: PhotoEntry[] = [];
      for (let i = 0; i < files.length; i++) {
        setCompressProgress(Math.round(((i + 0.5) / files.length) * 90));
        const dataUrl = await compressImage(files[i]);
        newEntries.push({ dataUrl, label: "" });
      }
      setCompressProgress(100);
      updateEntries([...entries, ...newEntries]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to process photo: ${msg}`);
    } finally {
      setCompressing(false);
      setCompressProgress(0);
    }
  };

  const removePhoto = (idx: number) => {
    updateEntries(entries.filter((_, i) => i !== idx));
  };

  const updateLabel = (idx: number, label: string) => {
    updateEntries(entries.map((p, i) => (i === idx ? { ...p, label } : p)));
  };

  const permissionDenied = error?.type === "permission";

  return (
    <div data-ocid="photo_attachments.root">
      {showPermissionDialog && (
        <CameraPermissionDialog
          onAllow={() => {
            setShowPermissionDialog(false);
            setShowCamera(true);
          }}
          onDeny={() => setShowPermissionDialog(false)}
        />
      )}

      <div className="flex gap-2 mb-3">
        {isSupported !== false && !permissionDenied && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={() =>
              showCamera ? setShowCamera(false) : setShowPermissionDialog(true)
            }
            disabled={compressing}
            data-ocid="photo_attachments.camera.button"
          >
            <Camera className="w-4 h-4" />
            {showCamera ? "Close Camera" : "Take Photo"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={compressing}
          data-ocid="photo_attachments.gallery.button"
        >
          <ImagePlus className="w-4 h-4" />
          Choose Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {compressing && (
        <div className="mb-3" data-ocid="photo_attachments.loading_state">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Processing photo... {compressProgress}%
            </span>
          </div>
          <Progress value={compressProgress} className="h-1.5" />
        </div>
      )}

      {permissionDenied && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          Camera access was denied. Please allow camera permission in your
          browser settings and refresh the page, or use "Choose Photo" to select
          from your gallery.
        </div>
      )}

      {showCamera && !permissionDenied && (
        <div className="mb-4 rounded-lg overflow-hidden border border-border bg-black">
          {error ? (
            <div className="flex flex-col items-center justify-center h-48 text-white gap-2 px-4 text-center">
              <p className="text-sm text-red-400">{error.message}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => startCameraRef.current()}
                className="text-white border-white/30"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <p className="text-white text-sm">Starting camera...</p>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex items-center justify-center gap-3 p-3 bg-black/80">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={() => switchCamera()}
                  disabled={isLoading || !isActive}
                  data-ocid="photo_attachments.switch_camera.button"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-white text-black hover:bg-white/90 px-6 font-semibold"
                  onClick={handleCapture}
                  disabled={!isActive || isLoading || compressing}
                  data-ocid="photo_attachments.capture.button"
                >
                  Capture
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20"
                  onClick={() => setShowCamera(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {entries.map((photo, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: photos are order-dependent
              key={idx}
              className="relative rounded-md overflow-hidden border border-border group flex flex-col"
            >
              <div className="relative" style={{ aspectRatio: "1" }}>
                <img
                  src={photo.dataUrl}
                  alt={photo.label || `Attachment ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  data-ocid={`photo_attachments.delete_button.${idx + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1 border-t border-border bg-muted/20 px-1.5 py-1">
                <Tag className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={photo.label}
                  onChange={(e) => updateLabel(idx, e.target.value)}
                  placeholder="Add a label..."
                  className="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/60 text-foreground"
                  data-ocid={`photo_attachments.label.input.${idx + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
