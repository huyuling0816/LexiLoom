import React from "react";
import "./game.css"
import {useLocation, useNavigate} from "react-router-dom";

const TestResult = () => {
    const location = useLocation()
    const navigate = useNavigate();
    const {score, time, isTest} = location.state || {}

    const returnToHome = () => {
        navigate("/")
    }

    const nextTest = () => {
        navigate("/self-test")
    }

    const nextBattle = () => {
        navigate("/battle-game")
    }

    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">
                {isTest ? "Self Test" : "Game Battle"}
            </h2>

            <div className="d-flex justify-content-center gap-4 mt-5">
                <div className="d-flex player-card winner justify-content-center flex-column"
                     style={{width: "50%"}}>
                    <h5 className="mt-2 fs-2">You got <strong className="fs-1">{score}</strong> points in <strong
                        className="fs-1">{Number(time).toFixed(3)}</strong>s !</h5>
                </div>
            </div>
            <div className="d-flex justify-content-center align-items-center gap-4 mt-5 buttons">
                <button className="btn game_button return_button fw-bold"
                        onClick={returnToHome}>
                    Return to Home
                </button>
                {isTest ?
                    <button className="btn game_button next_button fw-bold"
                            onClick={nextTest}>
                        Next Test
                    </button> :
                    <button className="btn game_button next_button fw-bold"
                            onClick={nextBattle}>Next Battle
                    </button>
                }
            </div>
        </div>
    )
}

export default TestResult;