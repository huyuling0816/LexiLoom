import React from "react";
import "./game.css"
import {useLocation, useNavigate} from "react-router-dom";

const BattleResult = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const {myScore, myTime, opponentName, opponentScore, opponentTime, isWin} = location.state || {}

    const returnToHome = () => {
        navigate("/")
    }

    const nextBattle = () => {
        navigate("/battle-game")
    }

    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">Game Battle</h2>

            <h2 className="mt-4 text-center fs-1">
                {isWin ? "You win the game!" : "Keep going, you'll win next time!"}
            </h2>

            <div className="d-flex justify-content-center gap-4 mt-5">
                <div className="d-flex player-card winner justify-content-center flex-column">
                    <h5 className="mt-2 fs-2"><strong className="fs-1">You</strong> got <strong
                        className="fs-1">{myScore}</strong> points in <strong
                        className="fs-1">{Number(myTime).toFixed(3)}</strong>s !</h5>
                </div>
                <div className="d-flex player-card loser justify-content-center flex-column">
                    <h5 className="mt-2 fs-2"><strong className="fs-1">{opponentName}</strong> got <strong
                        className="fs-1">{opponentScore}</strong> points in <strong
                        className="fs-1">{Number(opponentTime).toFixed(3)}</strong>s !</h5>
                </div>
            </div>

            <div className="d-flex justify-content-center gap-4 mt-5 buttons">
                <button className="btn game_button return_button fw-bold"
                        onClick={returnToHome}>Return to Home
                </button>
                <button className="btn game_button next_button fw-bold"
                        onClick={nextBattle}>Next Battle
                </button>
            </div>

        </div>
    )
}

export default BattleResult;
