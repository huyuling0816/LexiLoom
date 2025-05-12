import {createContext, useContext, useState, useEffect} from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [isLogin, setIsLogin] = useState(!!localStorage.getItem("user"));
    const [userInfo, setUserInfoState] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : { id: null, name: "" };
    });

    const setUserInfo = (user_id, username) => {
        const userObj = {
            id: user_id,
            name: username
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        setUserInfoState(userObj);
        setIsLogin(true);
    };

    const updateUsername = (newUsername) => {
        const updatedUser = {
            ...userInfo,
            name: newUsername
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserInfoState(updatedUser);
    };

    const unSetUserInfo = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("inGame");
        setUserInfoState({ id: null, name: "" });
        setIsLogin(false);
    };

    return (
        <AuthContext.Provider value={{
            isLogin, 
            setUserInfo, 
            unSetUserInfo, 
            userInfo,
            updateUsername
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
