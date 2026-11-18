export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPassword = (value) =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
