import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PbxFilterSelect({
  label,
  value,
  onValueChange,
  options = [],
  allLabel = 'All',
  className = 'w-[140px]',
}) {
  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <Select value={value || 'all'} onValueChange={onValueChange}>
      <SelectTrigger className={`h-9 bg-white text-sm ${className}`}>
        <SelectValue placeholder={label || allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {normalized.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
