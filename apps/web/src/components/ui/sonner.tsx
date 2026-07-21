import { Toaster as SonnerToaster } from 'sonner';

import { useThemeStore } from '@/stores/theme.store';

// App toast host. Thin wrapper over sonner that maps our design tokens onto its CSS
// variables and follows the app theme (incl. 'system'). Mounted once at the app root;
// fire toasts with `toast(...)` from 'sonner' anywhere.
export function Toaster() {
  const theme = useThemeStore((s) => s.theme);
  return (
    <SonnerToaster
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--popover)',
          color: 'var(--popover-foreground)',
          border: '1px solid var(--border)',
        },
      }}
    />
  );
}
