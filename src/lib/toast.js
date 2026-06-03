import { toast } from 'sonner';
import { getUserFacingErrorMessage } from '@/lib/errors';

export function showSuccess(message) {
  toast.success(message);
}

export function showError(error, fallback = 'Something went wrong. Please try again.') {
  toast.error(getUserFacingErrorMessage(error, fallback));
}

export function showInfo(message) {
  toast.info(message);
}
