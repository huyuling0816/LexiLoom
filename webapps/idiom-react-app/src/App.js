import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import React, {useEffect} from "react";
import MyNavBar from "./components/navbar/MyNavBar";
import Home from "./pages/home/Home";
import Flash from "./pages/flash/Flash";
import Collection from "./pages/collection/Collection";
import SelfTest from "./pages/game/SelfTest";
import Search from "./pages/search/Search";
import BattleResult from "./pages/game/BattleResult";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import {useAuth} from "./store/authContext";
import TestResult from "./pages/game/TestResult";
import PreTest from "./pages/game/PreTest";
import BattleGame from "./pages/game/BattleGame";
import Profile from "./pages/profile/Profile";
import Error from "./pages/error/Error";
import {fetchWithAuth} from "./utils/fetchWithAuth";

function App() {
    const {isLogin, setUserInfo, unSetUserInfo} = useAuth();
    const auth = useAuth();
    function ProtectedRoute({element}) {
        return isLogin ? element : <Navigate to="/login" replace/>;
    }

    useEffect(() => {
        console.log("fetch user status")
        fetchWithAuth("/get_user_status", {}, auth)
            .then((res) => res.json())
            .then((data) => {
                if (data.is_authenticated) {
                    setUserInfo(data.user_id, data.username);
                } else {
                    unSetUserInfo(); 
                }
            })
            .catch((err) => {
                console.error("Failed to fetch user status:", err);
                unSetUserInfo();
            });
    }, []);

    return (
        <Router>
            <MyNavBar/>
            <div style={{background: "#F1F0F0", flexGrow: 1}}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/flash-card" element={<ProtectedRoute element={<Flash/>}/>}/>
                    <Route path="/collection" element={<ProtectedRoute element={<Collection/>}/>}/>
                    <Route path="/battle-game" element={<ProtectedRoute element={<BattleGame/>}/>}/>
                    <Route path="/self-test" element={<ProtectedRoute element={<SelfTest/>}/>}/>
                    <Route path="/search" element={<ProtectedRoute element={<Search/>}/>}/>
                    <Route path="/battle-result" element={<ProtectedRoute element={<BattleResult/>}/>}/>
                    <Route path="/test-result" element={<ProtectedRoute element={<TestResult/>}/>}/>
                    <Route path="/pre-test" element={<ProtectedRoute element={<PreTest/>}/>}/>
                    <Route path="/profile" element={<ProtectedRoute element={<Profile/>}/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="*" element={<Error/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
