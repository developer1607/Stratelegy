import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { api } from '@/api/client';
import { showError, showSuccess } from '@/lib/toast';
import { validateContactForm } from '@/lib/crmFormValidation';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogForm,
  formDialogFooter,
} from '@/lib/formDialog';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportContactsDialog({ open, onOpenChange, onImportComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showError(null, 'Please select a file to import.');
      return;
    }

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const allowedExt = /\.(csv|xls|xlsx)$/i;
    if (!allowedTypes.includes(file.type) && !allowedExt.test(file.name)) {
      showError(null, 'File must be CSV, XLS, or XLSX.');
      return;
    }

    try {
      setUploading(true);
      const { file_url } = await api.integrations.Core.UploadFile({ file });

      setUploading(false);
      setExtracting(true);

      const jsonSchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' },
            position: { type: 'string' },
            source: { type: 'string' },
          },
        },
      };

      const extractResult = await api.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: jsonSchema,
      });

      setExtracting(false);

      if (extractResult.status === 'success' && extractResult.output) {
        const contacts = Array.isArray(extractResult.output)
          ? extractResult.output
          : [extractResult.output];

        const validContacts = contacts.filter((c) => {
          const errors = validateContactForm(c, { requireEmail: true });
          return Object.keys(errors).length === 0;
        });

        const invalidCount = contacts.length - validContacts.length;
        if (invalidCount > 0) {
          showError(null, `${invalidCount} row(s) skipped — each contact needs a valid name and email.`);
        }

        if (validContacts.length > 0) {
          await api.entities.Contact.bulkCreate(
            validContacts.map((c) => ({
              name: c.name,
              email: c.email,
              phone: c.phone || '',
              company: c.company || '',
              position: c.position || '',
              source: c.source || 'email',
              priority: 'Standard',
              status: 'active',
            }))
          );

          setResult({
            success: true,
            count: validContacts.length,
            message: `Imported ${validContacts.length} contact${validContacts.length > 1 ? 's' : ''}`,
          });
          showSuccess(`Imported ${validContacts.length} contact${validContacts.length > 1 ? 's' : ''}.`);

          setTimeout(() => {
            onImportComplete?.();
            onOpenChange(false);
            setFile(null);
            setResult(null);
          }, 2000);
        } else {
          showError(null, 'No valid contacts found. Each row needs a name and valid email.');
          setResult({
            success: false,
            message: 'File needs valid name and email for each contact.',
          });
        }
      } else {
        showError(null, extractResult.details || 'Failed to extract contacts from file.');
        setResult({
          success: false,
          message: extractResult.details || 'Failed to extract contacts from file',
        });
      }
    } catch (error) {
      setExtracting(false);
      showError(error, 'Import failed.');
      setResult({
        success: false,
        message: 'Import failed.',
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
    setResult(null);
    setUploading(false);
    setExtracting(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={formDialogContent('sm')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Import Contacts</DialogTitle>
          <DialogDescription>Upload a CSV or Excel file with contact information</DialogDescription>
        </DialogHeader>

        <div className={formDialogForm}>
          <div className={formDialogBody}>
            {!result ? (
              <>
                <div className="space-y-2">
                  <Label>Select File</Label>
                  <div className="flex flex-col gap-3">
                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-all hover:border-blue-500 hover:bg-blue-50/50">
                      <div className="flex flex-col items-center justify-center gap-2 px-4">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <p className="text-center text-sm text-gray-600">
                          {file ? file.name : 'Click to upload CSV or Excel'}
                        </p>
                        <p className="text-xs text-gray-400">CSV, XLS, XLSX</p>
                      </div>
                      <input
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {file && (
                      <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2">
                        <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                        <span className="min-w-0 flex-1 truncate text-sm text-blue-900">
                          {file.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                  <p className="font-semibold">Required columns:</p>
                  <ul className="ml-2 list-inside list-disc space-y-0.5">
                    <li>name</li>
                    <li>email</li>
                  </ul>
                  <p className="mt-2 font-semibold">Optional columns:</p>
                  <ul className="ml-2 list-inside list-disc space-y-0.5">
                    <li>phone, company, position, source</li>
                  </ul>
                </div>
              </>
            ) : (
              <div
                className={`flex items-center gap-3 rounded-lg p-4 ${result.success ? 'border border-green-200 bg-green-50' : 'border border-red-200 bg-red-50'}`}
              >
                {result.success ? (
                  <CheckCircle className="h-6 w-6 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
                )}
                <p
                  className={`text-sm font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}
                >
                  {result.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={handleClose}>
              {result?.success ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button onClick={handleImport} disabled={!file || uploading || extracting}>
                {uploading ? 'Uploading...' : extracting ? 'Processing...' : 'Import'}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
