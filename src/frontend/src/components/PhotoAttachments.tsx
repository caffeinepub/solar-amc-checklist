import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, RotateCcw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCamera } from "../camera/useCamera";

interface PhotoAttachmentsProps {
  reportId: string;
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

export default function PhotoAttachments({ reportId }: PhotoAttachmentsProps) {
  const storageKey = `reportPhotos:${reportId}`;

  const [photos, setPhotos] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  const [showCamera, setShowCamera] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const savePhotos = (updated: string[]) => {
    setPhotos(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const updated = [...photos, dataUrl];
      savePhotos(updated);
      setShowCamera(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(readers).then((dataUrls) => {
      const updated = [...photos, ...dataUrls];
      savePhotos(updated);
    });
    e.target.value = "";
  };

  const removePhoto = (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx);
    savePhotos(updated);
  };

  const handleTakePhotoClick = () => {
    if (showCamera) {
      setShowCamera(false);
    } else {
      setShowPermissionDialog(true);
    }
  };

  const handlePermissionAllow = () => {
    setShowPermissionDialog(false);
    setShowCamera(true);
  };

  const handlePermissionDeny = () => {
    setShowPermissionDialog(false);
  };

  const permissionDenied = error?.type === "permission";

  return (
    <div data-ocid="photo_attachments.root">
      {/* Camera permission dialog */}
      {showPermissionDialog && (
        <CameraPermissionDialog
          onAllow={handlePermissionAllow}
          onDeny={handlePermissionDeny}
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mb-3">
        {isSupported !== false && !permissionDenied && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={handleTakePhotoClick}
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

      {/* Permission denied notice */}
      {permissionDenied && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          Camera access was denied. Please allow camera permission in your
          browser settings and refresh the page, or use "Choose Photo" to select
          from your gallery.
        </div>
      )}

      {/* Camera preview */}
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
                  disabled={!isActive || isLoading}
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

      {/* Photo thumbnails */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, idx) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: photos are order-dependent
              key={idx}
              className="relative rounded-md overflow-hidden border border-border group"
              style={{ aspectRatio: "1" }}
            >
              <img
                src={src}
                alt={`Attachment ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                data-ocid={`photo_attachments.remove.button.${idx + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
