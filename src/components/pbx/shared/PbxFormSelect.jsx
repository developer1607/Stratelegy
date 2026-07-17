import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PbxFormSelect({
  label,
  id,
  value,
  onValueChange,
  options = [],
  placeholder = "Select…",
  required,
  disabled,
  className,
}) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <Select
        value={value || undefined}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger id={fieldId} className="bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** @param {Record<string, string>|null|undefined} map */
export function mapCodeLabelOptions(map) {
  if (!map || typeof map !== "object") return [];
  return Object.entries(map)
    .map(([value, label]) => ({ value, label: label || value }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
}
