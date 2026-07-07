import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PbxFilterSelect({
  label,
  value,
  onValueChange,
  options = [],
  allLabel = 'All',
  hideAll = false,
  className = 'w-[140px]',
}) {
  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );
  const selectValue = hideAll ? value : value || 'all';

  return (
    <Select value={selectValue} onValueChange={onValueChange}>
      <SelectTrigger className={`h-9 bg-white text-sm ${className}`}>
        <SelectValue placeholder={label || allLabel} />
      </SelectTrigger>
      <SelectContent>
        {!hideAll ? <SelectItem value="all">{allLabel}</SelectItem> : null}
        {normalized.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
