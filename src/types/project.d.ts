import type {
  UseMutationOptions,
  UseMutationResult,
} from '@tanstack/react-query';

declare module '@tanstack/react-query' {
  export function useMutation<TData = unknown, TError = Error, TVariables = unknown>(
    options: UseMutationOptions<TData, TError, TVariables>
  ): UseMutationResult<TData, TError, TVariables>;
}

/** @typedef {Record<string, boolean> & { isAdmin: boolean }} PortalPermissions */
