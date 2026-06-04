import * as React from 'react';

export function useToast(): Record<string, unknown>;
export const toast: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
