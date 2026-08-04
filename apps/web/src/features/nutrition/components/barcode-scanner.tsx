import { Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (ean: string) => void;
}

// Scan an EAN with the camera, an uploaded photo, or by typing it. zxing is imported
// lazily (only when the sheet opens) so it never weighs on the main bundle. Works
// cross-browser incl. iOS; if the camera is unavailable, the manual + upload fallbacks
// still work (desktop path).
export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [manual, setManual] = useState('');
  const [note, setNote] = useState<string | null>(null);

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }

  // Start the camera scanner while the sheet is open; stop it on close/unmount.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setNote(null);
    setManual('');
    void (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        if (cancelled || !videoRef.current) return;
        controlsRef.current = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: 'environment',
              // A small product barcode needs enough pixels to decode up close.
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          videoRef.current,
          (result) => {
            if (!result) return;
            stopCamera();
            onDetected(result.getText());
          },
        );
        // Enable continuous autofocus so small, close-up barcodes sharpen instead of
        // blurring (best-effort — not every device exposes focusMode).
        const stream = videoRef.current?.srcObject;
        if (stream instanceof MediaStream) {
          try {
            await stream.getVideoTracks()[0]?.applyConstraints({
              advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet],
            });
          } catch {
            // focusMode unsupported on this device — ignore.
          }
        }
      } catch {
        if (!cancelled) setNote('Camera unavailable — type the barcode or upload a photo.');
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
    // Only `open` should (re)start the camera; onDetected is used for a one-shot scan.
  }, [open]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(url);
      onDetected(result.getText());
    } catch {
      setNote('No barcode found in that image.');
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function submitManual() {
    const code = manual.trim();
    if (/^\d{8,14}$/.test(code)) onDetected(code);
    else setNote('Enter a valid 8–14 digit barcode.');
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Scan a barcode</SheetTitle>
          <SheetDescription>
            Point your camera at the barcode — hold it ~10 cm away and let it sharpen — or upload a
            photo of it, or type the number.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 p-4">
          <div className="bg-muted relative aspect-video overflow-hidden rounded-lg">
            <video ref={videoRef} className="size-full object-cover" muted playsInline />
          </div>

          {note ? <p className="text-muted-foreground text-sm">{note}</p> : null}

          <div className="flex gap-2">
            <Input
              inputMode="numeric"
              placeholder="Barcode number"
              className="h-11"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitManual();
              }}
            />
            <Button type="button" className="h-11" onClick={submitManual}>
              Use
            </Button>
          </div>

          <Button asChild variant="outline" className="h-11">
            <label>
              <Upload className="size-4" />
              Upload barcode photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onFile(e)}
              />
            </label>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
