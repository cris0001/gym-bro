import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useSettingsUiStore } from '../stores/settings-ui.store';

// The gear in the app chrome (mobile header, sidebar footer) that opens the Settings
// sheet — where the language, theme and accent controls live.
export function SettingsButton() {
  const setOpen = useSettingsUiStore((s) => s.setOpen);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9"
      aria-label="Settings"
      title="Settings"
      onClick={() => setOpen(true)}
    >
      <Settings className="size-5" />
    </Button>
  );
}
