/**
 * Form Validation Utilities
 * Real-time validation for authentication forms
 */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3; // 0 = weak, 1 = fair, 2 = good, 3 = strong
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  percentage: number;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

/**
 * Validates email format using regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Analyzes password strength and returns detailed metrics
 */
export const analyzePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&#]/.test(password),
  };

  // Count satisfied requirements
  const satisfiedCount = Object.values(requirements).filter(Boolean).length;

  // Calculate score (0-3)
  let score: 0 | 1 | 2 | 3;
  if (satisfiedCount <= 2) {
    score = 0; // Weak
  } else if (satisfiedCount === 3) {
    score = 1; // Fair
  } else if (satisfiedCount === 4) {
    score = 2; // Good
  } else {
    score = 3; // Strong
  }

  // Map score to label and color
  const labels: Record<0 | 1 | 2 | 3, 'Weak' | 'Fair' | 'Good' | 'Strong'> = {
    0: 'Weak',
    1: 'Fair',
    2: 'Good',
    3: 'Strong',
  };

  const colors: Record<0 | 1 | 2 | 3, string> = {
    0: '#ef4444', // red-500
    1: '#f59e0b', // amber-500
    2: '#eab308', // yellow-500
    3: '#22c55e', // green-500
  };

  const percentages: Record<0 | 1 | 2 | 3, number> = {
    0: 25,
    1: 50,
    2: 75,
    3: 100,
  };

  return {
    score,
    label: labels[score],
    color: colors[score],
    percentage: percentages[score],
    requirements,
  };
};

/**
 * Validates that passwords match
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword && confirmPassword.length > 0;
};

/**
 * Get email validation error message
 */
export const getEmailError = (email: string): string | null => {
  if (!email) return null; // Don't show error for empty (user hasn't typed yet)
  if (!validateEmail(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Get password validation error message
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) return null; // Don't show error for empty
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

/**
 * Get confirm password error message
 */
export const getConfirmPasswordError = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword) return null; // Don't show error for empty
  if (!validatePasswordMatch(password, confirmPassword)) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Check if form is valid (for submit button)
 */
export const isFormValid = (
  email: string,
  password: string,
  isSignup: boolean,
  confirmPassword?: string
): boolean => {
  const emailValid = validateEmail(email);
  const passwordValid = password.length >= 8;

  if (isSignup && confirmPassword !== undefined) {
    const passwordsMatch = validatePasswordMatch(password, confirmPassword);
    return emailValid && passwordValid && passwordsMatch;
  }

  return emailValid && passwordValid;
};
