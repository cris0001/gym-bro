import type { UseAddEntry } from '../hooks/use-add-entry';

import { AddPortionSheet } from './add-portion-sheet';
import { BarcodeScanner } from './barcode-scanner';
import { FoodSheet } from './food-sheet';

// The overlays shared by both add-entry layouts: the portion editor, the barcode
// scanner (touch only), and the food create/edit sheet. Driven off the shared hook so
// mobile and desktop wire them up identically.
export function AddEntryOverlays({ state }: { state: UseAddEntry }) {
  const { portionRow, setPortionRow, logPortion, canScan, scanning, setScanning, handleEan } =
    state;

  return (
    <>
      <AddPortionSheet
        row={portionRow}
        onClose={() => setPortionRow(null)}
        onAdd={(portion) => {
          if (portionRow) logPortion(portionRow, portion);
          setPortionRow(null);
        }}
      />

      {canScan ? (
        <BarcodeScanner
          open={scanning}
          onClose={() => setScanning(false)}
          onDetected={(ean) => {
            setScanning(false);
            void handleEan(ean);
          }}
        />
      ) : null}
      <FoodSheet />
    </>
  );
}
