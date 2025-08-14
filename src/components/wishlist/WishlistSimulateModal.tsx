import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function WishlistSimulateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simular economia mensal</DialogTitle>
          <DialogDescription>
            Funcionalidade de simulação ainda em desenvolvimento.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

