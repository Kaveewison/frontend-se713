/**
 * Type definitions for Reusable Common Components
 *
 * This file contains all TypeScript interfaces and type definitions
 * for the component library including input types, button variants,
 * validation states, and mask configurations.
 */

// Input Types
export type InputType =
  | "text"
  | "password"
  | "number"
  | "email"
  | "tel"
  | "search";

// Button Types
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

export type ButtonSize = "small" | "medium" | "large";

// Mask Types
export type MaskPattern = "citizenId" | "phone" | string;

// Validation State Interface
export interface ValidationState {
  error: boolean;
  errorMessage?: string;
  success?: boolean;
  touched?: boolean;
}

/**
 * Icon Props Interface
 *
 * Standard props interface for all icon components in the library.
 * All icon components should follow this consistent structure to ensure
 * uniform behavior and styling across the component library.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import type { IconProps } from '@/components/common/types';
 *
 * withDefaults(defineProps<IconProps>(), {
 *   size: 17,
 *   color: 'currentColor',
 *   strokeWidth: 2
 * });
 * </script>
 *
 * <template>
 *   <svg
 *     :width="size"
 *     :height="size"
 *     viewBox="0 0 24 24"
 *     fill="none"
 *     :stroke="color"
 *     :stroke-width="strokeWidth"
 *     stroke-linecap="round"
 *     stroke-linejoin="round"
 *   >
 *     <!-- SVG path content -->
 *   </svg>
 * </template>
 * ```
 *
 * Icon Component Pattern:
 *
 * 1. **Size**: Controls both width and height of the icon
 *    - Default: 17px for input components
 *    - 18px for button components
 *    - Accepts any number for custom sizing
 *
 * 2. **Color**: Controls the stroke color of the icon
 *    - Default: 'currentColor' (inherits from parent text color)
 *    - Accepts any valid CSS color value
 *    - Can be customized via CSS custom properties
 *    - Changes to primary color on input focus (handled by parent component)
 *
 * 3. **StrokeWidth**: Controls the thickness of icon lines
 *    - Default: 2 (provides good visibility at default sizes)
 *    - Accepts any number for custom line thickness
 *
 * SVG Structure Requirements:
 * - Use 24x24 viewBox for consistency
 * - Use fill="none" for outline-style icons
 * - Apply stroke-linecap="round" and stroke-linejoin="round" for smooth corners
 * - Position icons absolutely within input wrappers with pointer-events: none
 * - Use smooth color transitions (--transition-fast) for state changes
 *
 * Available Icon Components:
 * - IconUser: User profile icon (circle head + path body)
 * - IconLock: Padlock icon (rect body + path shackle)
 * - IconMail: Envelope icon (rect envelope + path flap)
 * - IconPhone: Phone handset icon
 * - IconSearch: Magnifying glass icon (circle lens + line handle)
 * - IconLocation: Map pin icon (path pin shape with circle)
 * - IconShield: Shield icon (path shield outline)
 *
 * Usage in Components:
 *
 * Icons can be used in two ways:
 *
 * 1. Via icon slot (custom icon content):
 * ```vue
 * <BaseInput v-model="email">
 *   <template #icon>
 *     <IconMail :size="17" />
 *   </template>
 * </BaseInput>
 * ```
 *
 * 2. Via icon prop (predefined icon name):
 * ```vue
 * <BaseInput v-model="email" icon="mail" />
 * ```
 *
 * @see Requirements 6.4, 6.10
 */
export interface IconProps {
  /** Icon size in pixels (width and height). Default: 17px for inputs, 18px for buttons */
  size?: number;
  /** Icon stroke color. Default: 'currentColor' to inherit from parent */
  color?: string;
  /** Icon stroke width. Default: 2 for good visibility */
  strokeWidth?: number;
}

// Mask Configuration Interface
export interface MaskConfig {
  pattern: string; // e.g., 'X-XXXX-XXXXX-XX-X'
  placeholder: string;
  transform?: (value: string) => string;
}

// Mask Patterns Constant
export const MASK_PATTERNS: Record<string, MaskConfig> = {
  citizenId: {
    pattern: "X-XXXX-XXXXX-XX-X",
    placeholder: "X-XXXX-XXXXX-XX-X",
    transform: (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 1) return digits;
      if (digits.length <= 5) return `${digits[0]}-${digits.slice(1)}`;
      if (digits.length <= 10)
        return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5)}`;
      if (digits.length <= 12)
        return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10)}`;
      return `${digits[0]}-${digits.slice(1, 5)}-${digits.slice(5, 10)}-${digits.slice(10, 12)}-${digits.slice(12, 13)}`;
    },
  },
  phone: {
    pattern: "XXX-XXX-XXXX",
    placeholder: "XXX-XXX-XXXX",
    transform: (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    },
  },
};

// Select Option Interfaces
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup<T = any> {
  label: string;
  options: SelectOption<T>[];
}

// Component Props Interfaces
export interface CommonInputProps {
  // v-model binding
  modelValue?: string | number | null;

  // Configuration
  label?: string;
  required?: boolean;
  showCharCount?: boolean;

  // Input configuration
  type?: InputType;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  autocomplete?: string;

  // Validation state
  error?: boolean | string;
  errorMessage?: string;
  success?: boolean;
  touched?: boolean;

  // Input constraints
  maxlength?: number;
  min?: number;
  max?: number;
  step?: number;

  // Icon support (Lucide Vue component or custom component)
  icon?: any;

  // Masking
  mask?: MaskPattern;

  // Loading state
  loading?: boolean;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedby?: string;
  id?: string;
}

export interface CommonInputEmits {
  "update:modelValue": (value: string | number | null) => void;
  blur: (event?: FocusEvent | Event) => void;
  focus: (event: FocusEvent) => void;
  input: (event: InputEvent) => void;
}

export interface BaseButtonProps {
  // Button variants
  variant?: ButtonVariant;
  size?: ButtonSize;

  // State
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;

  // Layout
  fullWidth?: boolean;
  iconOnly?: boolean;

  // Icon
  icon?: string;
  iconPosition?: "left" | "right";

  // Accessibility
  ariaLabel?: string;
  type?: "button" | "submit" | "reset";
}

export interface BaseButtonEmits {
  (e: "click", event: MouseEvent): void;
}

export interface BaseSelectProps<T = any> {
  // v-model binding
  modelValue: T;

  // Options
  options: SelectOption<T>[] | SelectOptionGroup<T>[];
  placeholder?: string;

  // State
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  touched?: boolean;
  loading?: boolean;

  // Icon
  icon?: string;

  // Accessibility
  ariaLabel?: string;
  id?: string;
}

export interface BaseSelectEmits<T = any> {
  "update:modelValue": (value: T) => void;
  change: (value: T) => void;
  blur: (event: FocusEvent) => void;
}

export interface BaseSearchInputProps {
  // v-model binding
  modelValue: string;

  // Configuration
  placeholder?: string;
  disabled?: boolean;
  debounceDelay?: number; // Default: 300ms

  // Styling
  rounded?: boolean; // Pill-style design

  // Accessibility
  ariaLabel?: string;
  id?: string;
}

export interface BaseSearchInputEmits {
  "update:modelValue": (value: string) => void;
  search: (value: string) => void; // Emitted after debounce
  clear: () => void;
}

export interface BaseFormGroupProps {
  // Label
  label?: string;
  required?: boolean;

  // Validation
  error?: boolean;
  errorMessage?: string;

  // Additional info
  hint?: string;

  // Layout
  layout?: "vertical" | "horizontal";

  // Accessibility
  for?: string; // Links label to input via for/id
}
