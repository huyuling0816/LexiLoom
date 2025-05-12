import React, {useEffect, useState} from "react";

const PreGame = ({opponentName}) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">Game Battle</h2>

            <div className="d-flex justify-content-center gap-4 mt-5 buttons">
                <div className="d-flex player-card winner justify-content-center flex-column"
                     style={{width: "50%"}}>
                    <h5 className="mt-2 fs-2 fw-bold">Match succeeds!</h5>
                    <h5 className="mt-2 fs-2 fw-bold">Your opponent is {opponentName}</h5>
                    <h5 className="mt-2 fs-2 fw-bold">The game will start in {countdown}s!</h5>
                </div>
            </div>

        </div>
    );
}

export default PreGame;