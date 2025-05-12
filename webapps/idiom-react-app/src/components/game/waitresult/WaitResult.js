import React, {useEffect, useState} from "react";

const WaitResult = () => {

    const [dots, setDots] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length < 3 ? prev + "." : ""));
        }, 500); // update every 0.5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="d-flex justify-content-center">
            <div className="d-flex justify-content-center fs-5 fw-bold">
                Waiting for the opponent to finish {dots}
            </div>
        </div>
    )
}

export default WaitResult;
