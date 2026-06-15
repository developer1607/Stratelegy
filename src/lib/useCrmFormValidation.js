import { useState, useCallback } from 'react';
import { fieldInputClass } from '@/components/forms/FieldError';

function isRequiredMessage(message) {
  return Boolean(message && message.endsWith(' is required.'));
}

function fieldsToRefresh(changedFields, errors, touched) {
  const changed = Array.isArray(changedFields) ? changedFields : [changedFields];
  return new Set([...changed, ...Object.keys(errors), ...Object.keys(touched)]);
}

/**
 * Inline CRM form validation — errors appear below fields as the user types.
 * Required-field errors show after blur or submit; format errors show immediately.
 */
export function useCrmFormValidation(validateFn) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const syncErrors = useCallback(
    (formData, changedFields, nextTouched, nextSubmitAttempted) => {
      const allErrors = validateFn(formData);
      setErrors((prev) => {
        const fields = fieldsToRefresh(changedFields, prev, nextTouched);
        const next = { ...prev };
        for (const field of fields) {
          const message = allErrors[field];
          const value = formData[field];
          const hasValue = value != null && String(value).trim() !== '';
          const show =
            nextSubmitAttempted ||
            nextTouched[field] ||
            (message && !isRequiredMessage(message) && hasValue);

          if (show && message) next[field] = message;
          else delete next[field];
        }
        return next;
      });
    },
    [validateFn]
  );

  const updateField = useCallback(
    (field, value, formData, setFormData, alsoRefresh = []) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      syncErrors(newData, [field, ...alsoRefresh], touched, submitAttempted);
    },
    [syncErrors, touched, submitAttempted]
  );

  const touchField = useCallback(
    (field, formData, alsoRefresh = []) => {
      setTouched((prev) => {
        const nextTouched = { ...prev, [field]: true };
        syncErrors(formData, [field, ...alsoRefresh], nextTouched, submitAttempted);
        return nextTouched;
      });
    },
    [syncErrors, submitAttempted]
  );

  const validateSubmit = useCallback(
    (formData) => {
      setSubmitAttempted(true);
      const allErrors = validateFn(formData);
      setErrors(allErrors);
      return Object.keys(allErrors).length === 0;
    },
    [validateFn]
  );

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);
  }, []);

  const fieldError = useCallback((field) => errors[field] || null, [errors]);

  const inputClassName = useCallback(
    (field) => fieldInputClass(Boolean(errors[field])),
    [errors]
  );

  const revalidate = useCallback(
    (formData, changedFields) => {
      syncErrors(formData, changedFields, touched, submitAttempted);
    },
    [syncErrors, touched, submitAttempted]
  );

  return {
    errors,
    fieldError,
    inputClassName,
    updateField,
    touchField,
    validateSubmit,
    resetValidation,
    revalidate,
  };
}
