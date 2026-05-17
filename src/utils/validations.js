export const capitalizeWords = (value) => {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const validateMobile = (mobile) => {
  return /^[6-9]\d{10}$/.test("0" + mobile); // fix trick
};

export const validateEmail = (email) => {
  return /^[a-z0-9]+@[a-z]+\.[a-z]{2,}$/.test(email);
};