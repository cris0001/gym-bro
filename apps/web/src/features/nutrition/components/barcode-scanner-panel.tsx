import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { FIELD_CLASS } from '@/lib/form-styles';
import { cn } from '@/lib/utils';

import { useNutritionTranslation } from '../i18n';

interface BarcodeScannerPanelProps {
  // Camera runs only while active (the host sheet is open / its Scan tab is showing).
  active: boolean;
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

// Viewfinder frame corner: two 3px strokes meeting at one corner of the target box.
const CORNER = 'absolute size-[26px] border-[#fdf6f5]';

// Scan an EAN with the camera, an uploaded photo, or by typing it — the body shared by
// the standalone scanner sheet and the "Scan barcode" tab of the add-food sheet. zxing
// is imported lazily (only when active) so it never weighs on the main bundle.
// Auto-picks the main rear lens (avoids the ultra-wide that can't focus close) with a
// manual camera switcher; tap the preview to refocus; a zoom slider when supported.
export function BarcodeScannerPanel({ active, onDetected }: BarcodeScannerPanelProps) {
  const t = useNutritionTranslation();
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

  // On activate: load the camera list and auto-pick the main rear lens. Reset when
  // deactivated.
  useEffect(() => {
    if (!active) {
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
  }, [active]);

  // Start (or restart, when the selected camera changes) the scanner.
  useEffect(() => {
    if (!active || !deviceId) return;
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
        if (!cancelled) setNote(t.barcode.cameraUnavailable);
      }
    })();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [active, deviceId]);

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
      setNote(t.barcode.noBarcodeInImage);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function submitManual() {
    const code = manual.trim();
    if (/^\d{8,14}$/.test(code)) onDetected(code);
    else setNote(t.barcode.invalidBarcode);
  }

  const rearCams = rearCameras(cameras);

  return (
    <div className="grid gap-4">
      <div className="relative h-[240px] overflow-hidden rounded-[18px] bg-[#1f191c]">
        <button
          type="button"
          onClick={() => void refocus()}
          aria-label={t.barcode.tapToFocus}
          className="absolute inset-0 block"
        >
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
        </button>

        {/* Target box: four corner strokes and the gold scan line. */}
        <span className="pointer-events-none absolute inset-x-[17%] top-1/2 h-[50%] -translate-y-1/2">
          <span
            className={cn(CORNER, 'top-0 left-0 rounded-tl-[6px] border-t-[3px] border-l-[3px]')}
          />
          <span
            className={cn(CORNER, 'top-0 right-0 rounded-tr-[6px] border-t-[3px] border-r-[3px]')}
          />
          <span
            className={cn(CORNER, 'bottom-0 left-0 rounded-bl-[6px] border-b-[3px] border-l-[3px]')}
          />
          <span
            className={cn(
              CORNER,
              'right-0 bottom-0 rounded-br-[6px] border-r-[3px] border-b-[3px]',
            )}
          />
          <span className="absolute inset-x-[7%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#d9a441]" />
        </span>

        <span className="pointer-events-none absolute bottom-3.5 left-1/2 -translate-x-1/2 text-[12.5px] font-semibold text-[#fdf6f5]/75">
          {t.barcode.tapToFocus}
        </span>

        {rearCams.length > 1 ? (
          <label className="absolute top-3 right-3 max-w-[60%]">
            <span className="sr-only">{t.barcode.cameraLabel}</span>
            <select
              value={deviceId ?? ''}
              onChange={(e) => selectCamera(e.target.value)}
              className="h-8 w-full appearance-none truncate rounded-full bg-[#fdf6f5]/15 pr-7 pl-3.5 text-[12.5px] font-semibold text-[#fdf6f5] outline-none backdrop-blur-sm"
            >
              {rearCams.map((cam, i) => (
                <option key={cam.deviceId} value={cam.deviceId} className="text-foreground">
                  {cam.label || t.barcode.cameraN(i + 1)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-[#fdf6f5]" />
          </label>
        ) : null}
      </div>

      {zoom ? (
        <label className="text-muted-foreground flex items-center gap-3 text-[13px] font-medium">
          {t.barcode.zoom}
          <input
            type="range"
            min={zoom.min}
            max={zoom.max}
            step={zoom.step}
            value={zoom.value}
            onChange={(e) => void applyZoom(Number(e.target.value))}
            className="accent-primary flex-1"
          />
        </label>
      ) : null}

      {note ? <p className="text-muted-foreground text-sm">{note}</p> : null}

      <div className="font-heading text-muted-foreground flex items-center gap-3 text-[13px] italic">
        <span className="h-px flex-1 bg-[#e4dad2] dark:bg-[#2f292d]" />
        {t.barcode.orTypeNumber}
        <span className="h-px flex-1 bg-[#e4dad2] dark:bg-[#2f292d]" />
      </div>

      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          placeholder={t.barcode.numberPlaceholder}
          className={cn(FIELD_CLASS, 'h-12 flex-1')}
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitManual();
          }}
        />
        <button
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 shrink-0 rounded-full px-5 text-[14.5px] font-semibold transition-colors"
          onClick={submitManual}
        >
          {t.barcode.use}
        </button>
      </div>

      <label className="text-primary mx-auto cursor-pointer text-[14px] font-semibold hover:underline">
        {t.barcode.uploadPhoto}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e)} />
      </label>
    </div>
  );
}
