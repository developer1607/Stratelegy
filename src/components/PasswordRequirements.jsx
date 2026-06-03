import React from 'react';
import { getPasswordChecks } from '@/lib/passwordValidation';
import { cn } from '@/lib/utils';

export default function PasswordRequirements({ password = '', className }) {
  const checks = getPasswordChecks(password);

  return (
    <ul className={cn('text-xs space-y-1', className)}>
      {checks.map(({ key, label, met }) => (
        <li
          key={key}
          className={cn(
            'flex items-start gap-1.5',
            met ? 'text-green-700' : 'text-muted-foreground'
          )}
        >
          <span className="font-medium shrink-0">{met ? '✓' : '○'}</span>
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}
