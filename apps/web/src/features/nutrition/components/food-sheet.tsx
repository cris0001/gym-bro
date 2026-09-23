import { useEffect, useState } from 'react';

import { FormSheet } from '@/components/form-sheet';

import { useScanFlow } from '../hooks/use-scan-flow';
import { useNutritionTranslation } from '../i18n';
import { useFoodUiStore } from '../stores/food-ui.store';
import { BarcodeScannerPanel } from './barcode-scanner-panel';
import { FoodAddModeToggle, type FoodAddMode } from './food-add-mode-toggle';
import { FoodForm } from './food-form';

// Sheet host for the food create/edit form. The form is keyed by the edited id (or
// 'new') so switching rows resets its default values. Creating a brand-new food offers
// a Manual / Scan barcode switch: Scan runs the camera inline (typing the number or
// uploading a photo still work without a camera), and a hit either lands the product in
// your foods (sheet closes) or reopens this form prefilled from the scan.
export function FoodSheet() {
  const t = useNutritionTranslation();
  const open = useFoodUiStore((s) => s.open);
  const editing = useFoodUiStore((s) => s.editing);
  const prefill = useFoodUiStore((s) => s.prefill);
  const onCreated = useFoodUiStore((s) => s.onCreated);
  const close = useFoodUiStore((s) => s.close);
  const { handleEan } = useScanFlow();
  const [mode, setMode] = useState<FoodAddMode>('manual');

  // Every fresh open starts on Manual.
  useEffect(() => {
    if (!open) setMode('manual');
  }, [open]);

  // Only a plain create gets the switch — not edits, and not a form already
  // prefilled from a scan.
  const showToggle = !editing && !prefill;
  const scanning = showToggle && mode === 'scan';

  async function onDetected(ean: string) {
    const outcome = await handleEan(ean);
    if (outcome === 'resolved') close();
    else if (outcome === 'form') setMode('manual');
  }

  return (
    <FormSheet
      open={open}
      onClose={close}
      title={editing ? t.foods.editFood : prefill ? t.foods.addProduct : t.foods.newFood}
      description={
        editing
          ? t.foods.editDesc
          : prefill
            ? t.foods.prefillDesc
            : scanning
              ? t.barcode.pointCamera
              : t.foods.newDesc
      }
    >
      {showToggle ? (
        <div className="px-5 pt-3 sm:px-6">
          <FoodAddModeToggle value={mode} onChange={setMode} />
        </div>
      ) : null}

      {scanning ? (
        <div className="px-5 pt-4 pb-6 sm:px-6">
          <BarcodeScannerPanel
            active={open && scanning}
            onDetected={(ean) => void onDetected(ean)}
          />
        </div>
      ) : (
        <FoodForm
          key={editing?.id ?? prefill?.ean ?? 'new'}
          editing={editing}
          prefill={prefill}
          onCreated={onCreated ?? undefined}
          onSuccess={close}
        />
      )}
    </FormSheet>
  );
}
