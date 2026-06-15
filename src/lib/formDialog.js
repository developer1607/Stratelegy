import { cn } from '@/lib/utils';

/** Mobile-safe shell: inset width, max viewport height, scrollable body + sticky footer. */
const FORM_DIALOG_SHELL =
  'flex max-h-[min(90dvh,calc(100%-2rem))] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-4 sm:w-full sm:p-6 sm:gap-4';

const FORM_DIALOG_WIDTH = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
};

/** DialogContent className for entity create/edit forms. */
export function formDialogContent(size = 'md') {
  return cn(FORM_DIALOG_SHELL, FORM_DIALOG_WIDTH[size] ?? FORM_DIALOG_WIDTH.md);
}

/** Header — leave room for the close (X) button. */
export const formDialogHeader = 'shrink-0 pr-8 text-left';

/** Scrollable form fields region. */
export const formDialogBody = 'min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-4';

/** Two-column field grid — stacks on mobile. */
export const formDialogGrid = 'grid grid-cols-1 gap-4 sm:grid-cols-2';

/** Single field wrapper. */
export const formDialogField = 'space-y-2';

/** Form element filling the dialog. */
export const formDialogForm = 'flex min-h-0 flex-1 flex-col';

/** Footer — full-width stacked buttons on mobile (DialogFooter adds sm:row). */
export const formDialogFooter = 'mt-auto shrink-0 gap-2 border-t border-border pt-4 sm:gap-3';

/** Responsive stat/card grid inside read-only dialogs. */
export const formDialogStatGrid = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
