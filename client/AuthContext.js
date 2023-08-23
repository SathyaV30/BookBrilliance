import React, {createContext, useState, useMemo} from "react";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    const isAuthenticated = useMemo(() => userToken !== null, [userToken]);
    
    const login = (token) => {
        setUserToken(token); // Ideally, this should be set to the actual token received after login.
        setIsLoading(false);
    }

    const logout = () => {
        setUserToken(null);
        setIsLoading(false);
    }

    return (
        <AuthContext.Provider value={{login, logout, isAuthenticated, userToken}}>
            {children}
        </AuthContext.Provider>
    );
}
