import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PbxFormField from '@/components/pbx/shared/PbxFormField';
import E911ProvisionSheet from '@/components/pbx/e911/E911ProvisionSheet';

export default function AddE911Dialog({ onSuccess }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add E911
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New E911 endpoint</DialogTitle>
            <DialogDescription>Enter the phone number to provision emergency location data.</DialogDescription>
          </DialogHeader>
          <PbxFormField
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="13155551212"
          />
          <DialogFooter>
            <Button
              type="button"
              disabled={!phone.trim()}
              onClick={() => {
                setOpen(false);
                setSheetOpen(true);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <E911ProvisionSheet
        phoneNumber={phone.trim()}
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setPhone('');
        }}
        onSuccess={() => {
          setPhone('');
          onSuccess?.();
        }}
      />
    </>
  );
}
