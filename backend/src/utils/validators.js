/**
 * Input validation helpers
 */

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

const validateRegistration = (data) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters.');
  }

  if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match.');
  }

  return errors;
};

const validateLogin = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Please provide a valid email address.');
  }

  if (!data.password) {
    errors.push('Password is required.');
  }

  return errors;
};

const validatePolicy = (data) => {
  const errors = [];

  if (!data.policyNumber || data.policyNumber.trim().length === 0) {
    errors.push('Policy number is required.');
  }

  if (!data.expiryDate) {
    errors.push('Expiry date is required.');
  }

  return errors;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRegistration,
  validateLogin,
  validatePolicy,
};
