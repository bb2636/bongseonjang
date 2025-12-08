import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';

export interface SignupFormData {
  email: string;
  verificationCode: string;
  isCodeSent: boolean;
  isEmailVerified: boolean;
  password: string;
  passwordConfirm: string;
  showPassword: boolean;
  showPasswordConfirm: boolean;
  isPasswordSet: boolean;
  name: string;
  phone: string;
  isPhoneVerified: boolean;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: 'male' | 'female' | '';
  referralId: string;
  isReferralIdVerified: boolean;
  isOver14: boolean;
  termsAgreed: boolean;
  privacyAgreed: boolean;
}

const STORAGE_KEY = 'signupFormData';

const defaultFormData: SignupFormData = {
  email: '',
  verificationCode: '',
  isCodeSent: false,
  isEmailVerified: false,
  password: '',
  passwordConfirm: '',
  showPassword: false,
  showPasswordConfirm: false,
  isPasswordSet: false,
  name: '',
  phone: '',
  isPhoneVerified: false,
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  gender: '',
  referralId: '',
  isReferralIdVerified: false,
  isOver14: false,
  termsAgreed: false,
  privacyAgreed: false,
};

function loadFormDataFromStorage(): Partial<SignupFormData> {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load form data from storage:', error);
  }
  return {};
}

function saveFormDataToStorage(data: SignupFormData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save form data to storage:', error);
  }
}

export function clearFormDataFromStorage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear form data from storage:', error);
  }
}

interface SignupFormContextType {
  formData: SignupFormData;
  updateFormData: (updates: Partial<SignupFormData>) => void;
  resetFormData: () => void;
}

const SignupFormContext = createContext<SignupFormContextType | null>(null);

interface SignupFormProviderProps {
  children: ReactNode;
}

export function SignupFormProvider({ children }: SignupFormProviderProps) {
  const [formData, setFormData] = useState<SignupFormData>(() => {
    const storedData = loadFormDataFromStorage();
    return { ...defaultFormData, ...storedData };
  });

  useEffect(() => {
    saveFormDataToStorage(formData);
  }, [formData]);

  const updateFormData = useCallback((updates: Partial<SignupFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(defaultFormData);
    clearFormDataFromStorage();
  }, []);

  return (
    <SignupFormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </SignupFormContext.Provider>
  );
}

export function useSignupFormState() {
  const context = useContext(SignupFormContext);
  if (!context) {
    throw new Error('useSignupFormState must be used within a SignupFormProvider');
  }
  return context;
}
