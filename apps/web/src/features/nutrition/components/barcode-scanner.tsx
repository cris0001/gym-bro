import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { useNutritionTranslation } from '../i18n';
import { BarcodeScannerPanel } from './barcode-scanner-panel';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onDetected: (ean: string) => void;
}

// The standalone scanner sheet (diary add flow, recipe builder). The camera and
// fallbacks live in BarcodeScannerPanel, which the add-food sheet also embeds.
export function BarcodeScanner({ open, onClose, onDetected }: BarcodeScannerProps) {
  const t = useNutritionTranslation();

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="bottom" className="gap-0">
        <SheetHeader>
          <SheetTitle>{t.barcode.title}</SheetTitle>
          <SheetDescription>{t.barcode.description}</SheetDescription>
        </SheetHeader>
        <div className="p-4">
          <BarcodeScannerPanel active={open} onDetected={onDetected} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
