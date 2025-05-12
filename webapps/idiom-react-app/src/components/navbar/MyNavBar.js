/* eslint-disable */
import React, {useEffect, useState} from "react";
import "./MyNavBar.css"
import {useAuth} from "../../store/authContext";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {fetchWithAuth} from "../../utils/fetchWithAuth";


const MyNavBar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const {isLogin, unSetUserInfo, userInfo} = useAuth();
    const auth = useAuth();

    useEffect(() => {
        fetchWithAuth("/get_user_status", {}, auth)
            .then(res => res.json())
            .then(data => {
                setIsAuthenticated(data.is_authenticated);
            });
    }, []);

    const handleLogout = () => {
        fetch("/logout", {method: "GET"})
            .then(() => {
                setIsAuthenticated(false);
                unSetUserInfo();
                navigate("/login");
            });
    };

    const navigateToProfile = () => {
        navigate("/profile");
    };

    const location = useLocation();

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white py-3">
            <div className="container-fluid">
                <span className="mb-0 fs-1 fw-bold logo">
                    {/*<a href="/" className="logo-link">LexiLoom</a>*/}
                    <Link to="/" className="logo-link">LexiLoom</Link>
                </span>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 fs-4 navbar-adjust">
                        <li className="nav-item me-4">
                            <Link to="/flash-card"
                                  className={`nav-link ${location.pathname === "/flash-card" ? "active-link" : ""}`}>Learn</Link>
                        </li>
                        <li className="nav-item me-4">
                            <Link to="/battle-game"
                                  className={`nav-link ${location.pathname === "/battle-game" ? "active-link" : ""}`}>Game</Link>
                        </li>
                        <li className="nav-item me-4">
                            <Link to="/pre-test"
                                  className={`nav-link ${location.pathname === "/pre-test" ? "active-link" : ""}`}>Test</Link>
                        </li>
                        <li className="nav-item me-4">
                            <Link to="/search"
                                  className={`nav-link ${location.pathname === "/search" ? "active-link" : ""}`}>Search</Link>
                        </li>
                        <li className="nav-item me-4">
                            <Link to="/collection"
                                  className={`nav-link ${location.pathname === "/collection" ? "active-link" : ""}`}>Collection</Link>
                        </li>
                    </ul>
                </div>

                {isAuthenticated ? (
                    <>
                        <button
                            type="button"
                            className="btn me-4 btn-lg"
                            id="user_button"
                            onClick={navigateToProfile}
                        >
                            {userInfo.name}
                        </button>
                        <button type="button" className="btn btn-lg btn-outline-danger" id="log_out_button"
                                onClick={handleLogout}>Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-outline-purple me-2 btn-lg">Log In</Link>
                        <Link to="/register" className="btn btn-purple btn-lg">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );

}

export default MyNavBar;




