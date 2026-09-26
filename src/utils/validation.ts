// Form validation helpers shared by the auth screens.

export const MIN_PASSWORD_LENGTH = 6;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function emailError(email: string): string | undefined {
  if (!email.trim()) return 'Email is required.';
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
}

export function newPasswordError(password: string): string | undefined {
  if (!password) return 'Password is required.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
}

export function confirmPasswordError(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
}
