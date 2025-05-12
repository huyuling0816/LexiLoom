import {useNavigate} from "react-router-dom";
import React from "react";

const PreTest = () => {
    const navigate = useNavigate();

    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">Self Test</h2>

            <div className="d-flex justify-content-center gap-4 mt-5">
                <div className="d-flex player-card winner justify-content-center flex-column"
                     style={{width: "50%"}}>
                    <h5 className="mt-2 fs-2 fw-bold">Are you ready for the test?</h5>
                </div>
            </div>

            <div className="d-flex justify-content-center align-items-center gap-4 mt-5 buttons">
                <button className="btn game_button return_button fw-bold fs-4"
                        onClick={() => navigate("/self-test")}
                        style={{width: "210px", height: "80px"}}>
                    Start Testing
                </button>
            </div>

        </div>
    )
}

export default PreTest;