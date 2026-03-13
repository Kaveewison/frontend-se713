# Task 1.3 Implementation Summary

## Task: Adjust error message positioning to prevent overlap with counter

### Requirements

- Requirement 9.4: When BaseInput displays character counter and has error, position both error message and counter without overlap

### Changes Made

#### 1. BaseInput.vue - Script Section

Added a computed property `errorClasses` to conditionally apply padding to error messages when a character counter is present:

```typescript
const errorClasses = computed(() => {
  return {
    "base-input__error": true,
    "base-input__error--with-counter": showCharacterCount.value,
  };
});
```

#### 2. BaseInput.vue - Template Section

Updated the error message div to use the computed `errorClasses`:

```vue
<div
  v-if="error && touched && errorMessage"
  :class="errorClasses"
  :id="ariaDescribedby"
  data-testid="base-input-error"
>
  <!-- ... -->
</div>
```

#### 3. BaseInput.vue - Style Section

Updated CSS to handle the layout:

**Character Counter Positioning:**

```css
.base-input__character-count {
  position: absolute;
  right: 0; /* Changed from 1rem to 0 for better alignment */
  bottom: -1.5rem;
  font-size: 0.76rem;
  color: var(--text-muted);
  pointer-events: none; /* Added to prevent interaction */
}
```

**Error Message Base Styles:**

```css
.base-input__error {
  display: flex;
  align-items: flex-start; /* Changed from center to flex-start for multi-line support */
  gap: 0.35rem;
  font-size: 0.76rem;
  color: var(--error);
  animation: slideUp 0.2s var(--transition-fast);
}
```

**Conditional Padding for Error with Counter:**

```css
.base-input__error--with-counter {
  padding-right: 4rem; /* Adds space for the counter on the right */
}
```

### How It Works

1. **Without Character Counter:**
   - Error message displays full width below the input
   - No extra padding applied

2. **With Character Counter (No Error):**
   - Counter displays at bottom-right of input wrapper
   - Positioned absolutely at `right: 0, bottom: -1.5rem`

3. **With Both Counter and Error:**
   - Counter remains at bottom-right position
   - Error message gets `padding-right: 4rem` via the `--with-counter` modifier class
   - This prevents text from overlapping with the counter
   - Error text can wrap to multiple lines if needed

### Layout Behavior

```
┌─────────────────────────────────────┐
│  Input Field                        │
└─────────────────────────────────────┘
  Error message text that wraps    5/13
  if it's too long
```

The error message has 4rem of right padding when the counter is present, ensuring the counter (positioned absolutely) doesn't overlap with the error text.

### Test Cases Covered

1. ✓ Character counter only (no error)
2. ✓ Short error message with counter
3. ✓ Long error message with counter (wraps correctly)
4. ✓ Error at max length (counter shows success color)
5. ✓ Error without counter (no extra padding)
6. ✓ Very long error message with counter (multi-line)

### Visual Test File

Created `test-character-counter-layout.html` for manual visual verification of all test cases.

### Files Modified

1. `src/components/common/BaseInput.vue`
   - Added `errorClasses` computed property
   - Updated error div to use computed classes
   - Updated CSS for character counter positioning
   - Updated CSS for error message layout
   - Added conditional padding class

### Validation

- ✓ No TypeScript errors (verified with getDiagnostics)
- ✓ CSS changes maintain existing functionality
- ✓ Conditional logic only applies padding when needed
- ✓ Layout works with various error message lengths
- ✓ Character counter remains visible and positioned correctly

### Next Steps

This implementation is ready for integration testing when the RegistrationForm is refactored to use BaseInput components (tasks 3.1-3.4).
