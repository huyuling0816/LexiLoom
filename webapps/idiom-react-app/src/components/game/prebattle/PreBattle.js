import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const PreBattle = () => {
    const navigate = useNavigate();
    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + "." : ""));
        }, 500); // 每0.5秒更新
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">Game Battle</h2>

            <div className="d-flex justify-content-center gap-4 mt-5">
                <div className="d-flex player-card winner justify-content-center flex-column"
                     style={{width: "50%"}}>
                    <h5 className="mt-2 fs-2 fw-bold">Searching for an opponent {dots}</h5>
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-center gap-4 mt-5 buttons">
                <button className="btn game_button return_button fw-bold fs-4"
                        onClick={() => navigate("/")}
                        style={{width: "210px", height: "80px"}}>
                    Cancel
                </button>
            </div>

        </div>
    )
}

export default PreBattle;