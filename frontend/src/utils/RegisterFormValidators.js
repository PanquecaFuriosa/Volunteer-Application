export const UsernameValidation = {
  LONG_USERNAME: 0,
  EMPTY_USERNAME: 1,
  NON_ALPHANUMERIC: 2,
  VALID_USERNAME: 3,
};

export const FullnameValidation = {
  LONG_NAME: 0,
  EMPTY_NAME: 1,
  NON_ALPHANUMERIC: 2,
  VALID_NAME: 3,
};

/**
 * Validates a username. It must be less than 16 chars long and at least
 * 1 char long. It can only contain alphanumeric characters.
 * @param {*} Username username to validate
 * @returns
 */
export const ValidateUserName = (Username) => {
  const username = Username.trim();
  if (username.length > 16) 
    return UsernameValidation.LONG_USERNAME;

  if (username.length === 0) 
    return UsernameValidation.EMPTY_USERNAME;

  const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
  return alphanumericRegex.test(username)
    ? UsernameValidation.VALID_USERNAME
    : UsernameValidation.NON_ALPHANUMERIC;
};


/**
 * Validates a fullname. It must contain less than 64 chars and more than
 * 0 chars. Additionally, it must be alphanumeric.
 * @param {*} name name to validate
 * @returns
 */
export const ValidateName = (name) => {
  const trimName = name.trim();
  if (trimName.length > 64) 
    return FullnameValidation.LONG_NAME;

  if (trimName.length === 0) 
    return FullnameValidation.EMPTY_NAME;

  const alphanumericRegex = /^[a-zA-Z\s]*$/;
  return alphanumericRegex.test(trimName) 
    ? FullnameValidation.VALID_NAME 
    : FullnameValidation.NON_ALPHANUMERIC;
};

/**
 * Validates institutional id. The id must be less than 16 chars long
 * @param {*} id id to validate
 * @returns true if the id is valid/false otherwise
 */
export const ValidateId = (id) => id.length < 16 && id.length >= 0;


export const UsernameValidationLabel = (validation) => {
  switch (validation) {
    case UsernameValidation.LONG_USERNAME:
      return "Username is too long";
    case UsernameValidation.NON_ALPHANUMERIC:
      return "Username must be alphanumeric";
    case UsernameValidation.EMPTY_USERNAME:      
      return "Username must not be empty";
    default:
      return "Username";
  }
}

export const FullnameValidationLabel = (validation) => {
  switch (validation) {
    case FullnameValidation.LONG_NAME:
      return "Fullname is too long";
    case FullnameValidation.NON_ALPHANUMERIC:
      return "Fullname must be alphanumeric";
    case FullnameValidation.EMPTY_NAME:
      return "Fullname must not be empty";
    default:
      return "Fullname";
  }
}