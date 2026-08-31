// Customized from the shadcn default:
// - the bottom variant is a full-width bottom sheet that slides up on mobile, and a
//   centered, width-capped modal card (zoom+fade) on sm+ screens — a sheet on phones,
//   a dialog on desktop, so it never becomes an awkward full-width bar;
// - Sheet wires up useSheetBackClose so the phone Back button closes an open sheet
//   instead of navigating away to another URL (applies to every sheet in the app);
// - Warm-editorial: --card surface, 2xl radius on the desktop modal, a serif SheetTitle,
//   and a grab-handle affordance on mobile bottom sheets.
import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { XIcon } from 'lucide-react';

import { useSheetBackClose } from '@/hooks/use-sheet-back-close';
import { cn } from '@/lib/utils';

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  useSheetBackClose(props.open, props.onOpenChange);
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({ ...props }: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = 'right',
  onOpenAutoFocus,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        // Don't move focus to the first field when a sheet opens — on mobile that
        // pops the keyboard immediately. Callers can still pass their own handler.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          onOpenAutoFocus?.(event);
        }}
        className={cn(
          'bg-card data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          side === 'right' &&
            'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left' &&
            'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top' &&
            'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
          // Mobile: full-screen, slides up from the bottom edge, scrollable (so tall
          // content / open selects never overflow a short bottom sheet). sm+: a centered
          // modal card — positioned like a dialog (left/top-1/2 + -translate-1/2 so its
          // height is content-driven, not stretched to the viewport), width-capped and
          // only as tall as its content up to 85dvh (then it scrolls), zoom+fade in. A
          // bottom sheet on phones, a modal on desktop, from one component.
          side === 'bottom' &&
            'max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom inset-x-0 top-0 bottom-0 h-dvh overflow-y-auto border-t sm:left-1/2 sm:right-auto sm:top-[45%] sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:h-auto sm:max-h-[85dvh] sm:w-[calc(100%-2rem)] sm:max-w-2xl lg:max-w-3xl sm:rounded-2xl sm:border sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:fade-in-0 sm:data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      >
        {/* Grab-handle affordance on mobile bottom sheets (warm-editorial). */}
        {side === 'bottom' ? (
          <div
            aria-hidden
            className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-[#e4dad2] sm:hidden dark:bg-[#453840]"
          />
        ) : null}
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring hover:bg-muted absolute top-3 right-3 flex size-9 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-foreground font-heading text-lg font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
