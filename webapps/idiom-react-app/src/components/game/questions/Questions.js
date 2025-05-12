import React, {useEffect, useState} from "react";
import "./Questions.css";

const Questions = ({question, options, correctAns, onAnswer, timeLeft}) => {
    const [selected, setSelected] = useState(null)
    const [isAns, setIsAns] = useState(false)

    useEffect(() => {
        setSelected(null)
        setIsAns(false)
    }, [question])

    const handleAns = (option) => {
        setSelected(option)
        setIsAns(true)
        onAnswer(option)
    }

    const getButtonClass = (option) => {
        if (isAns) {
            if (option === correctAns) return "btn btn-success border choice-btn"
            if (option === selected) return "btn btn-danger border choice-btn"
        }
        return "btn btn-light border choice-btn"
    }

    return (
        <div>
            <p className="mt-4 text-center fs-5 question mt-4 mb-4 fw-bold">{question}</p>

            <div className="mt-3 d-grid gap-1 choices">
                {options.map((option, index) => (
                    <button
                        key={index}
                        className={getButtonClass(option)}
                        onClick={() => handleAns(option)}
                        disabled={isAns || timeLeft === 0}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Questions;