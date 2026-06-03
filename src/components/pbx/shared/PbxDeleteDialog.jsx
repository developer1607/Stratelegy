import React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

export default function PbxDeleteDialog({
  triggerLabel = 'Delete',
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  loading = false,
  triggerVariant = 'destructive',
  triggerSize = 'sm',
}) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    try {
      await onConfirm?.();
      setOpen(false);
    } catch {
      // Keep dialog open on failure; caller shows toast.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size={triggerSize} variant={triggerVariant} disabled={loading}>
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={loading} variant="destructive">
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
