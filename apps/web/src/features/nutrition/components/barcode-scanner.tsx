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

// Enumerate video inputs. Labels are only populated once camera permission is granted,
// so request it once if they're blank, then re-enumerate.
async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
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
    return videos;
  } catch {
    return [];
  }
}

// The rear cameras (fall back to all if none are labelled back-facing).
function rearCameras(cams: MediaDeviceInfo[]): MediaDeviceInfo[] {
  const back = cams.filter((d) => /back|rear|environment/i.test(d.label));
  return back.length > 0 ? back : cams;
}

// Android labels the rear cameras "camera2 <id>, facing back"; the main sensor is the
// lowest id (0). Pull that id out for ranking (Infinity when there's no such number).
function cameraIndex(label: string): number {
  const m = /camera2?\s+(\d+)/i.exec(label);
  return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
}

// Auto-pick the main (1×) rear lens. First drop lenses that focus poorly on close
// barcodes (iOS: "Back Ultra Wide/Telephoto Camera"); then, among what's left, prefer
// the lowest Android camera id (the main sensor), falling back to enumeration order.
function autoPickMain(cams: MediaDeviceInfo[]): string | undefined {
  const pool = rearCameras(cams);
  const usable = pool.filter((d) => !/ultra|tele|macro|depth/i.test(d.label));
  const ranked = (usable.length > 0 ? usable : pool)
    .slice()
    .sort((a, b) => cameraIndex(a.label) - cameraIndex(b.label));
  return ranked[0]?.deviceId;
}

// Remember the chosen camera per device so a user only picks the good lens once. The
// deviceId is stable per origin after permission is granted.
const CAMERA_KEY = 'gym-bro-scanner-camera';
function readSavedCamera(): string | null {
  try {
    return localStorage.getItem(CAMERA_KEY);
  } catch {
    return null;
  }
}

// Scan an EAN with the camera, an uploaded photo, or by typing it. zxing is imported
// lazily (only when the sheet opens) so it never weighs on the main bundle. Auto-picks
// the main rear lens (avoids the ultra-wide that can't focus close) with a manual camera
// switcher; tap the preview to refocus; a zoom slider appears when supported.
export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const [manual, setManual] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomCap | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    trackRef.current = null;
  }

  // Switch camera and remember the choice on this device.
  function selectCamera(id: string) {
    setDeviceId(id);
    try {
      localStorage.setItem(CAMERA_KEY, id);
    } catch {
      // storage unavailable — ignore.
    }
  }

  // On open: load the camera list and auto-pick the main rear lens. Reset on close.
  useEffect(() => {
    if (!open) {
      setCameras([]);
      setDeviceId(null);
      return;
    }
    let cancelled = false;
    setManual('');
    setNote(null);
    void (async () => {
      const cams = await listCameras();
      if (cancelled) return;
      setCameras(cams);
      setDeviceId((current) => {
        if (current) return current;
        // Prefer the camera this device chose before, then auto-pick the main lens.
        const saved = readSavedCamera();
        if (saved && cams.some((c) => c.deviceId === saved)) return saved;
        return autoPickMain(cams) ?? cams[0]?.deviceId ?? null;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Start (or restart, when the selected camera changes) the scanner.
  useEffect(() => {
    if (!open || !deviceId) return;
    let cancelled = false;
    setNote(null);
    setZoom(null);
    void (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        const reader = new BrowserMultiFormatReader();
        if (cancelled || !videoRef.current) return;
        controlsRef.current = await reader.decodeFromConstraints(
          {
            video: {
              deviceId: { exact: deviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
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
  }, [open, deviceId]);

  async function refocus() {
    const track = trackRef.current;
    if (!track) return;
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

  const rearCams = rearCameras(cameras);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>Scan a barcode</SheetTitle>
          <SheetDescription>
            Point the camera at the barcode and tap to focus. If it won&rsquo;t sharpen, switch
            camera or zoom in — or upload a photo, or type the number.
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

          {rearCams.length > 1 ? (
            <label className="flex items-center gap-2 text-sm">
              Camera
              <select
                value={deviceId ?? ''}
                onChange={(e) => selectCamera(e.target.value)}
                className="border-input h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm"
              >
                {rearCams.map((cam, i) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

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
