import { createContext, useState } from "react";

/**
 * Context used to manage authentication and authorization
 */
const AuthContext = createContext({});

/**
 * Provides the authorization context
 */
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
