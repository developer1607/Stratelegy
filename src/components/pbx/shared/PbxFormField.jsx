import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PbxFormField({ label, id, className, ...props }) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <Input id={fieldId} {...props} />
    </div>
  );
}
