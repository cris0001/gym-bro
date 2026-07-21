import { Toaster as SonnerToaster } from 'sonner';

// App toast host. Thin wrapper over sonner that maps our design tokens onto its CSS
// variables so toasts match the theme (and dark mode when it lands). Mounted once at
// the app root; fire toasts with `toast(...)` from 'sonner' anywhere.
export function Toaster() {
  return (
    <SonnerToaster
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
