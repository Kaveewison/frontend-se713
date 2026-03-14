/**
 * Form Management Composable
 * 
 * Provides comprehensive form state management with validation, dirty tracking,
 * and field-level error handling. Validates fields on change and provides
 * form-level validation before submission.
 * 
 * @module composables/useForm
 * 
 * @example
 * ```typescript
 * const { formData, errors, isValid, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationRules: {
 *     email: [(v) => v ? null : 'กรุณากรอกอีเมล'],
 *     password: [(v) => v.length >= 8 ? null : 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร']
 *   },
 *   onSubmit: async (values) => {
 *     await api.login(values);
 *   }
 * });
 * ```
 */

import { ref, computed } from 'vue';

/**
 * Validation rule function
 * 
 * @param value - Field value to validate
 * @returns Error message string if invalid, null if valid
 */
export type ValidationRule<T = any> = (value: T) => string | null;

/**
 * Form field state
 */
export interface FormField<T = any> {
  /** Current field value */
  value: T;
  /** Current error message (null if valid) */
  error: string | null;
  /** Whether the field has been modified */
  isDirty: boolean;
}

/**
 * Form composable options
 */
export interface UseFormOptions<T extends Record<string, any>> {
  /** Initial form values */
  initialValues: T;
  /** Validation rules for each field */
  validationRules?: Partial<Record<keyof T, ValidationRule[]>>;
  /** Optional submit handler */
  onSubmit?: (values: T) => void | Promise<void>;
}

/**
 * Form Management Composable
 * 
 * Manages form state, validation, and submission with automatic field validation
 * on change and comprehensive error handling.
 * 
 * @param options - Form configuration options
 * @returns Form state and management functions
 * 
 * @example
 * ```typescript
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   validationRules: {
 *     name: [(v) => v ? null : 'กรุณากรอกชื่อ'],
 *     email: [(v) => /\S+@\S+\.\S+/.test(v) ? null : 'รูปแบบอีเมลไม่ถูกต้อง']
 *   }
 * });
 * ```
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialValues, validationRules = {}, onSubmit } = options;

  // Form data - ref containing all field values
  const formData = ref<T>({ ...initialValues } as T);
  
  // Errors - ref containing error messages for each field
  const errors = ref<Partial<Record<keyof T, string>>>({});
  
  // Dirty fields - tracks which fields have been modified
  const dirtyFields = ref<Partial<Record<keyof T, boolean>>>({});

  // Touched fields - tracks which fields have been interacted with
  const touched = ref<Partial<Record<keyof T, boolean>>>({});

  /**
   * Computed property indicating if the form is valid
   * 
   * Form is valid when there are no errors
   */
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0;
  });

  /**
   * Computed property indicating if any field has been modified
   */
  const isDirty = computed(() => {
    return Object.values(dirtyFields.value).some(Boolean);
  });

  /**
   * Validates a single field against its validation rules
   * 
   * @param field - Field name to validate
   * @returns True if field is valid, false otherwise
   * 
   * @example
   * ```typescript
   * const isEmailValid = validateField('email');
   * ```
   */
  function validateField(field: keyof T): boolean {
    if (!validationRules) {
      delete errors.value[field];
      return true;
    }
    
    const rules = (validationRules as Record<keyof T, ValidationRule[]>)[field];
    
    // No rules means field is valid
    if (!rules || rules.length === 0) {
      delete errors.value[field];
      return true;
    }

    // Run all validation rules for the field
    for (const rule of rules) {
      const error = rule(formData.value[field as string]);
      if (error) {
        errors.value[field] = error;
        return false;
      }
    }

    // All rules passed, clear any existing error
    delete errors.value[field];
    return true;
  }

  /**
   * Marks a single field as touched and validates it
   * 
   * @param field - Field name
   */
  function touchField(field: keyof T): void {
    touched.value[field] = true;
    validateField(field);
  }

  /**
   * Validates all fields in the form
   * 
   * @returns True if all fields are valid, false otherwise
   * 
   * @example
   * ```typescript
   * if (validateForm()) {
   *   // All fields are valid
   *   await submitForm();
   * }
   * ```
   */
  function validateForm(): boolean {
    let isFormValid = true;

    // Validate each field
    for (const field in formData.value) {
      touched.value[field as keyof T] = true;
      if (!validateField(field as keyof T)) {
        isFormValid = false;
      }
    }

    return isFormValid;
  }

  /**
   * Sets a field value and validates it
   * 
   * Marks the field as dirty and triggers validation.
   * 
   * @param field - Field name
   * @param value - New field value
   * 
   * @example
   * ```typescript
   * setFieldValue('email', 'user@example.com');
   * ```
   */
  function setFieldValue<K extends keyof T>(field: K, value: T[K]): void {
    formData.value[field] = value;
    dirtyFields.value[field] = true;
    validateField(field);
  }

  /**
   * Manually sets an error for a field
   * 
   * Useful for setting server-side validation errors.
   * 
   * @param field - Field name
   * @param error - Error message
   * 
   * @example
   * ```typescript
   * setFieldError('email', 'อีเมลนี้ถูกใช้งานแล้ว');
   * ```
   */
  function setFieldError(field: keyof T, error: string): void {
    errors.value[field] = error;
  }

  /**
   * Clears the error for a specific field
   * 
   * @param field - Field name
   * 
   * @example
   * ```typescript
   * clearFieldError('email');
   * ```
   */
  function clearFieldError(field: keyof T): void {
    delete errors.value[field];
  }

  /**
   * Resets the form to initial values
   * 
   * Clears all errors and dirty field tracking.
   * 
   * @example
   * ```typescript
   * resetForm(); // Form is back to initial state
   * ```
   */
  function resetForm(): void {
    // Reset form data to initial values
    formData.value = { ...initialValues } as T;
    
    // Clear all errors
    errors.value = {};
    
    // Clear all dirty field flags
    dirtyFields.value = {};

    // Clear touched flags
    touched.value = {};
  }

  /**
   * Handles form submission
   * 
   * Validates the form and calls the onSubmit handler if valid.
   * Prevents default form submission if event is provided.
   * 
   * @param event - Optional form submit event
   * 
   * @example
   * ```typescript
   * <form @submit="handleSubmit">
   *   <!-- form fields -->
   * </form>
   * ```
   */
  async function handleSubmit(event?: Event): Promise<void> {
    event?.preventDefault();

    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    // Call the submit handler if provided
    if (onSubmit) {
      await onSubmit(formData.value);
    }
  }

  return {
    /** Reactive form data object */
    formData,
    /** Reactive errors object */
    errors,
    /** Computed: Is form valid? */
    isValid,
    /** Computed: Has any field been modified? */
    isDirty,
    /** Reactive touched state object */
    touched,
    /** Mark field as touched and validate */
    touchField,
    /** Validate a single field */
    validateField,
    /** Validate all fields */
    validateForm,
    /** Set field value and validate */
    setFieldValue,
    /** Manually set field error */
    setFieldError,
    /** Clear field error */
    clearFieldError,
    /** Reset form to initial state */
    resetForm,
    /** Handle form submission */
    handleSubmit,
  };
}
