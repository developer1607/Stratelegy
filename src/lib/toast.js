import { toast } from 'sonner';
import { displayError } from '@/lib/errors';

export function showSuccess(message) {
  toast.success(message);
}

export function showError(error, fallback = 'Request failed.') {
  toast.error(displayError(error, fallback));
}

export function showInfo(message) {
  toast.info(message);
}
