import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError } from '@/lib/toast';
import { validateContactForm } from '@/lib/crmFormValidation';
import { useCrmFormValidation } from '@/lib/useCrmFormValidation';
import FieldError from '@/components/forms/FieldError';
import { cn } from '@/lib/utils';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogForm,
  formDialogFooter,
} from '@/lib/formDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import AccountSelectField from '@/components/forms/AccountSelectField';
import ConfigNameSelect from '@/components/forms/ConfigNameSelect';
import { useCrmConfig } from '@/hooks/useCrmConfig';
import { contactSourceOptions } from '@/lib/crmConfig';
import { api } from '@/api/client';
import { Camera, X, User } from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  account_id: '',
  position: '',
  role: '',
  priority: 'Standard',
  status: 'active',
  source: 'email',
  engagement_level: 'Medium',
  company_size: '',
  last_activity_date: '',
  photo_url: '',
};

export default function ContactDialog({ open, onOpenChange, onSubmit, isLoading, initialData }) {
  const { defaults, contactSources } = useCrmConfig({ enabled: open });
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const sourceOptions = contactSourceOptions(contactSources, formData.source);
  const validate = useCallback(
    (data) =>
      validateContactForm(data, {
        requireEmail: true,
        allowedSources: contactSourceOptions(contactSources, data.source),
      }),
    [contactSources],
  );
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) {
      resetValidation();
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          company: initialData.company || '',
          account_id: initialData.account_id || '',
          position: initialData.position || '',
          role: '',
          priority: 'Standard',
          status: 'active',
          source: initialData.source || defaults.contactSource,
          engagement_level: 'Medium',
          company_size: '',
          last_activity_date: '',
          photo_url: initialData.photo_url || '',
        });
      } else {
        setFormData({ ...EMPTY_FORM, source: defaults.contactSource });
      }
      return;
    }
    setFormData(EMPTY_FORM);
    resetValidation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [open, initialData, resetValidation, defaults.contactSource]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError(null, 'Use JPG or PNG.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo_url: file_url });
    } catch (error) {
      console.error('Failed to upload photo:', error);
      showError(null, 'Upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData({ ...formData, photo_url: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSubmit(formData)) return;
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('sm')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Create New Contact</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="grid gap-6">
              <div className="flex flex-col items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                    {formData.photo_url ? (
                      <img
                        src={formData.photo_url}
                        alt={formData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-3xl">
                        {getInitials(formData.name) || <User className="w-10 h-10 text-white/80" />}
                      </span>
                    )}
                  </div>
                  {formData.photo_url && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors border-2 border-blue-500"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                {uploadingPhoto && <p className="text-xs text-gray-500">Uploading photo...</p>}
                <div className="w-full space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => validation.updateField('name', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('name', formData)}
                    className={cn('text-center font-medium', validation.inputClassName('name'))}
                    aria-invalid={Boolean(validation.fieldError('name'))}
                  />
                  <FieldError message={validation.fieldError('name')} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Contact Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => validation.updateField('email', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('email', formData)}
                    className={validation.inputClassName('email')}
                    aria-invalid={Boolean(validation.fieldError('email'))}
                  />
                  <FieldError message={validation.fieldError('email')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => validation.updateField('phone', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('phone', formData)}
                    className={validation.inputClassName('phone')}
                    aria-invalid={Boolean(validation.fieldError('phone'))}
                  />
                  <FieldError message={validation.fieldError('phone')} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Professional Details
                </h3>
                <AccountSelectField
                  company={formData.company}
                  accountId={formData.account_id}
                  onCompanyChange={(value) =>
                    validation.updateField('company', value, formData, setFormData)
                  }
                  onAccountIdChange={(id) =>
                    validation.updateField('account_id', id, formData, setFormData)
                  }
                  onCompanyBlur={() => validation.touchField('company', formData)}
                  companyError={validation.fieldError('company')}
                  companyInputClassName={validation.inputClassName('company')}
                />
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    placeholder="Sales Manager"
                    value={formData.position}
                    onChange={(e) => validation.updateField('position', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('position', formData)}
                    className={validation.inputClassName('position')}
                  />
                  <FieldError message={validation.fieldError('position')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">How did you meet?</Label>
                <ConfigNameSelect
                  id="source"
                  value={formData.source}
                  onValueChange={(value) => validation.updateField('source', value, formData, setFormData)}
                  options={sourceOptions}
                  className={validation.inputClassName('source')}
                />
                <FieldError message={validation.fieldError('source')} />
              </div>
            </div>
          </div>
          <DialogFooter className={formDialogFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || uploadingPhoto}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploadingPhoto}>
              {isLoading ? 'Creating...' : 'Create Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
