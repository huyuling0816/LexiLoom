import React from "react";

const RepeatGame = () => {
    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">Game Battle</h2>

            <div className="d-flex justify-content-center gap-4 mt-5 buttons">
                <div className="d-flex player-card winner justify-content-center flex-column"
                     style={{width: "50%"}}>
                    <h5 className="mt-2 fs-2 fw-bold">You have started a game!</h5>
                </div>
            </div>

        </div>
    );
}

export default RepeatGame;
