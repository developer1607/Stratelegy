import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const selectContentProps = { position: 'popper', className: 'max-h-[min(16rem,50dvh)]' };

/** Select backed by Settings config item names (Contact sources, Lead stages, etc.). */
export default function ConfigNameSelect({
  id,
  value,
  onValueChange,
  options = [],
  placeholder = 'Select',
  disabled = false,
  className = '',
}) {
  return (
    <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent {...selectContentProps}>
        {options.map((name) => (
          <SelectItem key={name} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
