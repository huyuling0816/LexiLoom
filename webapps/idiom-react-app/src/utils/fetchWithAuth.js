export const fetchWithAuth = async (url, options = {}, auth) => {
    const {isLogin, setUserInfo, unSetUserInfo} = auth;
    const res = await fetch(url, {
        credentials: 'include',  // 确保带上 cookie
        ...options
    });
    if (res.status === 401) {
        unSetUserInfo();
        alert("Session expired or you have logged in somewhere else.");
        window.location.href = "/login";
    }
    return res;
};
