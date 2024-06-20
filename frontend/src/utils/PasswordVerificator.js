/**
 * Utilities to validate a password and generate a random one
 */
const ValidPasswordEnum = {
  LESS_THAN_3: 0,
  SPECIAL_CHARS: 1,
  VALID: 2,
};

/**
 * Validates a password. It checks that the password is at least 3 characters long
 * and doesnt contains special characters
 * @param {*} password 
 * @returns 
 */
const ValidatePassword = (password) => {
  if (password.length < 3) 
    return ValidPasswordEnum.LESS_THAN_3;

  const specialCharacters = ["!",'"',"·","$","%","&","/","(",")","?","¿","”",];
  for (const char of password) {
    if (specialCharacters.includes(char))
      return ValidPasswordEnum.SPECIAL_CHARS;
  }
  return ValidPasswordEnum.VALID;
};

/**
 * Generates a random alphanumeric password that is 8 characters long
 * @returns Randomly generated password
 */
const GenerateRandomPassword = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
};


const PasswordValidationLabel = (validation) => {
  switch (validation) {
    case ValidPasswordEnum.LESS_THAN_3:
      return "Password too short";
    case ValidPasswordEnum.SPECIAL_CHARS:
      return "Password must not include !\"·$%&/()?¿";
    default:
      return "Password";
  }
}

export { ValidatePassword, GenerateRandomPassword, ValidPasswordEnum, PasswordValidationLabel };
