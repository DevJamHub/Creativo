import {
  MIN_PASSWORD_LENGTH,
  confirmPasswordError,
  emailError,
  isValidEmail,
  newPasswordError,
} from '@/utils/validation';

describe('isValidEmail / emailError', () => {
  it('accepts a normal address, ignoring spaces around it', () => {
    expect(isValidEmail(' nadia@creativo.id ')).toBe(true);
    expect(emailError('nadia@creativo.id')).toBeUndefined();
  });

  it('explains what is wrong in Indonesian', () => {
    expect(emailError('')).toBe('Email wajib diisi.');
    expect(emailError('   ')).toBe('Email wajib diisi.');
    expect(emailError('nadia@creativo')).toBe('Masukkan alamat email yang valid.');
    expect(emailError('nadia creativo.id')).toBe('Masukkan alamat email yang valid.');
  });
});

describe('newPasswordError', () => {
  it(`needs at least ${MIN_PASSWORD_LENGTH} characters`, () => {
    expect(newPasswordError('')).toBe('Kata sandi wajib diisi.');
    expect(newPasswordError('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    );
    expect(newPasswordError('a'.repeat(MIN_PASSWORD_LENGTH))).toBeUndefined();
  });
});

describe('confirmPasswordError', () => {
  it('asks for the same password again', () => {
    expect(confirmPasswordError('rahasia1', '')).toBe('Ulangi kata sandi kamu.');
    expect(confirmPasswordError('rahasia1', 'rahasia2')).toBe('Kata sandi tidak cocok.');
    expect(confirmPasswordError('rahasia1', 'rahasia1')).toBeUndefined();
  });
});
