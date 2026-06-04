import * as React from 'react';

export function useFormField(): Record<string, unknown>;
export const Form: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
export const FormItem: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
export const FormLabel: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
export const FormControl: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
export const FormDescription: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
export const FormMessage: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
export const FormField: React.ForwardRefExoticComponent<
  React.PropsWithChildren<Record<string, unknown>> & React.RefAttributes<HTMLElement>
>;
