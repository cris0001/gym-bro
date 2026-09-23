import type { ReactNode } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface FormSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children: ReactNode;
}

// A sheet that hosts a small create/edit form: a bottom sheet on phones, a narrow
// (460px) centered dialog on desktop. Parchment surface with a serif title and a
// square muted close button, so every form sheet reads the same.
export function FormSheet({ open, onClose, title, description, children }: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-background gap-0 sm:max-w-[460px] lg:max-w-[460px]"
        closeClassName="bg-muted top-4 right-4 size-8 rounded-[10px] opacity-100 hover:bg-[#e4dad2] sm:top-5 sm:right-5 dark:hover:bg-[#342d31] [&_svg]:size-4"
      >
        <SheetHeader className="gap-0.5 px-5 pt-4 pb-1 pr-14 sm:px-6 sm:pt-6">
          <SheetTitle className="text-[22px] leading-tight">{title}</SheetTitle>
          <SheetDescription className="text-[12.5px]">{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
