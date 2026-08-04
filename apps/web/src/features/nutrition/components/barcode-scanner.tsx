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

// focusMode / zoom aren't in the standard DOM constraint types yet.
interface FocusZoom {
  focusMode?: string;
  zoom?: number;
}
function advancedConstraints(set: FocusZoom): MediaTrackConstraints {
  return { advanced: [set] } as unknown as MediaTrackConstraints;
}

interface ZoomCap {
  min: number;
  max: number;
  step: number;
  value: number;
}

// Phones expose several rear cameras; `facingMode: 'environment'` often picks the
// ultra-wide (0.5×/0.6×), which can't focus on a small barcode up close. Pick the main
// (1×) rear lens instead: the back camera whose label isn't ultra-wide / tele / macro /
// depth (iOS labels are descriptive; on Android the first back camera is the main one).
// Labels are only populated after camera permission, so request it once if needed.
async function pickRearCameraDeviceId(): Promise<string | undefined> {
  if (!navigator.mediaDevices?.enumerateDevices) return undefined;
  try {
    let videos = (await navigator.mediaDevices.enumerateDevices()).filter(
      (d) => d.kind === 'videoinput',
    );
    if (videos.length > 0 && videos.every((d) => d.label === '')) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      stream.getTracks().forEach((t) => t.stop());
      videos = (await navigator.mediaDevices.enumerateDevices()).filter(
        (d) => d.kind === 'videoinput',
      );
    }
    const back = videos.filter((d) => /back|rear|environment/i.test(d.label));
    const pool = back.length > 0 ? back : videos;
    const main = pool.find((d) => !/ultra|tele|macro|depth|zoom|wide-angle/i.test(d.label));
    return (main ?? pool[0])?.deviceId;
  } catch {
    return undefined;
  }
}

// Scan an EAN with the camera, an uploaded photo, or by typing it. zxing is imported
// lazily (only when the sheet opens) so it never weighs on the main bundle. Works
// cross-browser incl. iOS; the manual + upload fallbacks cover the desktop / no-camera
// path. Tap the preview to refocus; a zoom slider appears when the device supports it —
// key for small barcodes the lens can't focus on up close (hold further + zoom in).
export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const [manual, setManual] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomCap | null>(null);

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    trackRef.current = null;
  }

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setNote(null);
    setManual('');
    setZoom(null);
    void (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        const deviceId = await pickRearCameraDeviceId();
        if (cancelled || !videoRef.current) return;
        const video: MediaTrackConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }),
        };
        controlsRef.current = await reader.decodeFromConstraints(
          { video },
          videoRef.current,
          (result) => {
            if (!result) return;
            stopCamera();
            onDetected(result.getText());
          },
        );

        const srcObject = videoRef.current?.srcObject;
        const track =
          srcObject instanceof MediaStream ? (srcObject.getVideoTracks()[0] ?? null) : null;
        trackRef.current = track;
        if (track) {
          // Continuous autofocus so close-up barcodes sharpen (best-effort).
          try {
            await track.applyConstraints(advancedConstraints({ focusMode: 'continuous' }));
          } catch {
            // focusMode unsupported — ignore.
          }
          const caps = track.getCapabilities?.() as
            | (MediaTrackCapabilities & { zoom?: { min: number; max: number; step?: number } })
            | undefined;
          if (caps?.zoom && caps.zoom.max > caps.zoom.min && !cancelled) {
            setZoom({
              min: caps.zoom.min,
              max: caps.zoom.max,
              step: caps.zoom.step ?? 0.1,
              value: caps.zoom.min,
            });
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

  async function refocus() {
    const track = trackRef.current;
    if (!track) return;
    // Re-trigger autofocus — single-shot, then back to continuous (best-effort).
    try {
      await track.applyConstraints(advancedConstraints({ focusMode: 'single-shot' }));
      await track.applyConstraints(advancedConstraints({ focusMode: 'continuous' }));
    } catch {
      // unsupported — ignore.
    }
  }

  async function applyZoom(value: number) {
    setZoom((z) => (z ? { ...z, value } : z));
    try {
      await trackRef.current?.applyConstraints(advancedConstraints({ zoom: value }));
    } catch {
      // unsupported — ignore.
    }
  }

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
            Point the camera at the barcode and tap to focus. If it won&rsquo;t sharpen up close,
            hold it further away and zoom in — or upload a photo, or type the number.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 p-4">
          <button
            type="button"
            onClick={() => void refocus()}
            aria-label="Tap to focus"
            className="bg-muted relative block aspect-video w-full overflow-hidden rounded-lg"
          >
            <video ref={videoRef} className="size-full object-cover" muted playsInline />
            <span className="bg-background/70 text-muted-foreground absolute bottom-1 left-1/2 -translate-x-1/2 rounded px-2 py-0.5 text-xs">
              Tap to focus
            </span>
          </button>

          {zoom ? (
            <label className="flex items-center gap-3 text-sm">
              Zoom
              <input
                type="range"
                min={zoom.min}
                max={zoom.max}
                step={zoom.step}
                value={zoom.value}
                onChange={(e) => void applyZoom(Number(e.target.value))}
                className="flex-1"
              />
            </label>
          ) : null}

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
