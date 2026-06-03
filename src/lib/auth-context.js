import { createContext } from 'react';

/** Stable context instance — kept in its own module so Vite HMR does not replace it. */
export const AuthContext = createContext(null);
