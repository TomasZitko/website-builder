import { useState, useEffect, useCallback } from 'react';
import {
  validateEmail,
  analyzePasswordStrength,
  getEmailError,
  getPasswordError,
  getConfirmPasswordError,
  isFormValid,
  type PasswordStrength,
} from '@/utils/validators';

interface ValidationState {
  email: {
    isValid: boolean;
    error: string | null;
    touched: boolean;
  };
  password: {
    isValid: boolean;
    error: string | null;
    strength: PasswordStrength | null;
    touched: boolean;
  };
  confirmPassword: {
    isValid: boolean;
    error: string | null;
    touched: boolean;
  };
}

interface UseFormValidationReturn {
  validation: ValidationState;
  validateField: (field: 'email' | 'password' | 'confirmPassword') => void;
  setFieldTouched: (field: 'email' | 'password' | 'confirmPassword') => void;
  isSubmitDisabled: boolean;
}

export const useFormValidation = (
  email: string,
  password: string,
  confirmPassword: string,
  isSignup: boolean
): UseFormValidationReturn => {
  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, error: null, touched: false },
    password: { isValid: false, error: null, strength: null, touched: false },
    confirmPassword: { isValid: false, error: null, touched: false },
  });

  // Debounced email validation
  useEffect(() => {
    if (!validation.email.touched) return;

    const timer = setTimeout(() => {
      const error = getEmailError(email);
      const isValid = validateEmail(email);

      setValidation((prev) => ({
        ...prev,
        email: { ...prev.email, isValid, error },
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [email, validation.email.touched]);

  // Real-time password validation and strength analysis
  useEffect(() => {
    if (!validation.password.touched) return;

    const timer = setTimeout(() => {
      const error = getPasswordError(password);
      const strength = password ? analyzePasswordStrength(password) : null;
      const isValid = password.length >= 8;

      setValidation((prev) => ({
        ...prev,
        password: { ...prev.password, isValid, error, strength },
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [password, validation.password.touched]);

  // Real-time confirm password validation
  useEffect(() => {
    if (!isSignup || !validation.confirmPassword.touched) return;

    const timer = setTimeout(() => {
      const error = getConfirmPasswordError(password, confirmPassword);
      const isValid = password === confirmPassword && confirmPassword.length > 0;

      setValidation((prev) => ({
        ...prev,
        confirmPassword: { ...prev.confirmPassword, isValid, error },
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [password, confirmPassword, isSignup, validation.confirmPassword.touched]);

  // Mark field as touched
  const setFieldTouched = useCallback(
    (field: 'email' | 'password' | 'confirmPassword') => {
      setValidation((prev) => ({
        ...prev,
        [field]: { ...prev[field], touched: true },
      }));
    },
    []
  );

  // Validate specific field immediately (for onBlur)
  const validateField = useCallback(
    (field: 'email' | 'password' | 'confirmPassword') => {
      setFieldTouched(field);

      switch (field) {
        case 'email': {
          const error = getEmailError(email);
          const isValid = validateEmail(email);
          setValidation((prev) => ({
            ...prev,
            email: { ...prev.email, isValid, error },
          }));
          break;
        }
        case 'password': {
          const error = getPasswordError(password);
          const strength = password ? analyzePasswordStrength(password) : null;
          const isValid = password.length >= 8;
          setValidation((prev) => ({
            ...prev,
            password: { ...prev.password, isValid, error, strength },
          }));
          break;
        }
        case 'confirmPassword': {
          const error = getConfirmPasswordError(password, confirmPassword);
          const isValid = password === confirmPassword && confirmPassword.length > 0;
          setValidation((prev) => ({
            ...prev,
            confirmPassword: { ...prev.confirmPassword, isValid, error },
          }));
          break;
        }
      }
    },
    [email, password, confirmPassword, setFieldTouched]
  );

  // Check if submit should be disabled
  const isSubmitDisabled = !isFormValid(email, password, isSignup, confirmPassword);

  return {
    validation,
    validateField,
    setFieldTouched,
    isSubmitDisabled,
  };
};
