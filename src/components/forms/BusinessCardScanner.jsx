import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scan, Upload, Loader2 } from 'lucide-react';
import { api } from '@/api/client';
import { showError } from '@/lib/toast';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogForm,
  formDialogFooter,
} from '@/lib/formDialog';

export default function BusinessCardScanner({ open, onOpenChange, onContactExtracted }) {
  const [isScanning, setIsScanning] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) {
      showError(null, 'Please select an image to scan.');
      return;
    }

    setIsScanning(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });

      const result = await api.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' },
            position: { type: 'string' },
          },
        },
      });

      if (result.status === 'success' && result.output) {
        onContactExtracted(result.output);
        onOpenChange(false);
        setFile(null);
      } else {
        showError(null, 'Card not readable. Enter details manually.');
      }
    } catch (error) {
      console.error('Error scanning business card:', error);
      showError(null, 'Scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('sm')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Scan Business Card</DialogTitle>
        </DialogHeader>
        <div className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center sm:p-8">
              <Scan className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-sm text-gray-600">
                Upload a photo or image of the business card
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mx-auto max-w-full sm:max-w-xs"
              />
              {file && (
                <p className="mt-2 truncate text-sm text-green-600">Selected: {file.name}</p>
              )}
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleScan} disabled={!file || isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Scan Card
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
