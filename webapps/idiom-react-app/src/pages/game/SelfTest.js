import React, {useEffect, useRef, useState} from "react";
import "./game.css"
import {useNavigate} from 'react-router-dom';
import Questions from "../../components/game/questions/Questions";
import {getCSRFToken, getRandomInt} from "../../utils/utils";
import ShuffleQuestion from "../../components/game/questions/ShuffleQuestion";
import {useAuth} from "../../store/authContext";
import {fetchWithAuth} from "../../utils/fetchWithAuth";

const SelfTest = () => {

    const user = JSON.parse(localStorage.getItem("user"))
    const auth = useAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([])
    const [index, setIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(20)
    const [score, setScore] = useState(0)
    const tmpScore = useRef(0)
    const [answered, setAnswered] = useState(false)
    const sessionId = useRef(null)

    useEffect(() => {
        fetchWithAuth("/start_test", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({user_id: user.id})
        }, auth)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP status: ${response.status}`);
                }
                return response.json();
            })
            .then(res => {
                sessionId.current = res.session_id
                let response_data = res.questions;
                response_data.forEach((question) => {
                    let options = [];
                    options.push(question.option_1);
                    options.push(question.option_2);
                    options.push(question.option_3);
                    let randomIndex = getRandomInt(0, 3);
                    options.splice(randomIndex, 0, question.answer);
                    question.options = options;
                });
                setQuestions(response_data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [])

    useEffect(() => {
        if (timeLeft === 0) {
            handleNextQuestion()
        } else if (!answered) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, answered])

    const handleAnswer = (selectedAns) => {
        const correctAns = questions[index].answer
        if (selectedAns === correctAns) {
            setScore(score => score + 10)
            tmpScore.current += 10
        }
        setAnswered(true)
        setTimeout(() => handleNextQuestion(), 500)
    }

    const handleShuffleAnswer = (isCorrect) => {
        if (isCorrect) {
            setScore(score => score + 10)
            tmpScore.current += 10
        }
        setAnswered(true)
        setTimeout(() => handleNextQuestion(), 500)
    }

    const handleNextQuestion = () => {
        if (index < questions.length - 1) {
            setIndex((index) => index + 1)
            setTimeLeft(20)
            setAnswered(false)
        } else {
            fetchWithAuth("/end_test", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify({
                    session_id: sessionId.current,
                    score: tmpScore.current
                })
            }, auth)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(res => {
                    let time = res.time / 1000;
                    navigate('/test-result', {
                        state: {
                            score: tmpScore.current,
                            time: time,
                            isTest: true
                        }
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    if (!questions.length) {
        return <div></div>
    }

    return (
        <div className="game_container">

            <h2 className="mt-4 fw-bolder text-center fs-1 title">Self Test</h2>

            <div className="fs-4 time">Time Left: <strong>{timeLeft}</strong></div>

            <div className="progress-container mt-3">
                <div className="left text-center fs-4 fw-bold">{user.name}</div>
                <div className="center text-center" style={{marginTop: "6%"}}>
                    <div className="progress">
                        <div className="progress-bar custom-progress-bar " role="progressbar"
                             style={{width: `${index * 10}%`}}></div>
                    </div>
                </div>
                <div className="right text-center fs-2 fw-bold">{score}</div>
            </div>
            {
                questions[index].question.startsWith("Please figure out") ? (
                    <ShuffleQuestion question={questions[index].question}
                                     idiom={questions[index].answer}
                                     onAnswer={handleShuffleAnswer}/>
                ) : (
                    <Questions question={questions[index].question} options={questions[index].options}
                               correctAns={questions[index].answer} onAnswer={handleAnswer}/>
                )
            }
        </div>
    )
}

export default SelfTest;