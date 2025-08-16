import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface InsightDrawerProps {
  title: string;
  description?: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InsightDrawer({
  title,
  description,
  children,
  open,
  onOpenChange,
}: InsightDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-80 sm:w-96 bg-background p-6 border-l border-white/10 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="space-y-2">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            {description && (
              <Dialog.Description className="text-sm text-fg-muted">
                {description}
              </Dialog.Description>
            )}
          </div>
          <div className="mt-4 overflow-y-auto">{children}</div>
          <Dialog.Close className="absolute top-4 right-4 rounded-sm text-neutral-500 dark:text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

