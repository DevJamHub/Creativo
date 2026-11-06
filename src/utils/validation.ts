// Form validation shared by the auth screens (Week 3 · validation before authentication).
// Input is checked in the app first, so an empty or malformed form never reaches the server and the
// user gets a clear message right away. The server checks the same rules again (server/app.js).

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function fullNameError(name: string): string | undefined {
  if (!name.trim()) return 'Nama lengkap wajib diisi.';
  if (name.trim().length > 80) return 'Nama maksimal 80 karakter.';
}

export function emailError(email: string): string | undefined {
  if (!email.trim()) return 'Email wajib diisi.';
  if (!isValidEmail(email)) return 'Masukkan alamat email yang valid.';
}

/** Login accepts an email or a username */
export function identifierError(identifier: string): string | undefined {
  const value = identifier.trim();
  if (!value) return 'Email atau username wajib diisi.';
  if (value.includes('@') && !isValidEmail(value)) return 'Masukkan alamat email yang valid.';
}

/** Logging in: only required; the server decides whether it is right */
export function passwordError(password: string): string | undefined {
  if (!password) return 'Kata sandi wajib diisi.';
}

/** A new password (sign up, reset): at least 8 characters, with letters and numbers */
export function newPasswordError(password: string): string | undefined {
  if (!password) return 'Kata sandi wajib diisi.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Kata sandi harus berisi huruf dan angka.';
}

export function confirmPasswordError(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Ulangi kata sandi kamu.';
  if (password !== confirm) return 'Kata sandi tidak cocok.';
}

export function resetCodeError(code: string): string | undefined {
  if (!code.trim()) return 'Kode reset wajib diisi.';
  if (!/^\d{6}$/.test(code.trim())) return 'Kode reset terdiri dari 6 angka.';
}
