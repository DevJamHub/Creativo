// Form validation helpers shared by the auth screens.

export const MIN_PASSWORD_LENGTH = 6;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function emailError(email: string): string | undefined {
  if (!email.trim()) return 'Email wajib diisi.';
  if (!isValidEmail(email)) return 'Masukkan alamat email yang valid.';
}

export function newPasswordError(password: string): string | undefined {
  if (!password) return 'Kata sandi wajib diisi.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
}

export function confirmPasswordError(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Ulangi kata sandi kamu.';
  if (password !== confirm) return 'Kata sandi tidak cocok.';
}
