import {useNavigate} from "react-router-dom";
import React, {useEffect, useRef, useState} from "react";
import PreBattle from "../../components/game/prebattle/PreBattle";
import {formatDate, getCSRFToken, getRandomInt} from "../../utils/utils";
import Questions from "../../components/game/questions/Questions";
import WaitResult from "../../components/game/waitresult/WaitResult";
import ShuffleQuestion from "../../components/game/questions/ShuffleQuestion";
import PreGame from "./PreGame";
import RepeatGame from "./RepeatGame";
import {useAuth} from "../../store/authContext";
import {fetchWithAuth} from "../../utils/fetchWithAuth";

const BattleGame = () => {

    const user = JSON.parse(localStorage.getItem("user"))
    const navigate = useNavigate();
    const socketRef = useRef(null)

    const [gameState, setGameState] = useState("Matching");
    const [questions, setQuestions] = useState([])
    const [index, setIndex] = useState(0)
    const [timeLeft, setTimeLeft] = useState(-1)
    const [score, setScore] = useState(0)
    const [answered, setAnswered] = useState(false)

    const [opponentName, setOpponentName] = useState(null)
    const [opponentScore, setOpponentScore] = useState(0)
    const opponentScoreRef = useRef(0)
    const [opponentIndex, setOpponentIndex] = useState(0)

    const finalScore = useRef(-1)
    const isOpponentFinished = useRef(false)
    const [opponentLeftMsgVisible, setOpponentLeftMsgVisible] = useState(false)
    const [isOpponentLeft, setIsOpponentLeft] = useState(false)
    const opponentFinishTime = useRef(null)
    const battleId = useRef(null)
    const isPlayer1 = useRef(false)
    const auth = useAuth()

    useEffect(() => {
        if (localStorage.getItem("inGame") != null) {
            return
        }
        localStorage.setItem("inGame", "true")
        socketRef.current = new WebSocket(`/ws/battle/${user.id}/`)
        socketRef.current.onopen = () => {
            console.log("Connected to web socket server")
        }
        socketRef.current.onclose = (event) => {
            console.log("Web socket closed", event)
        }
        socketRef.current.onerror = (error) => {
            console.log("Web socket error", error)
        }
        let opponent_name = null
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            // game start
            if (data.type === "player_joined") {
                console.log("Player joined")
                let player1_id = data.player1_id
                opponent_name = player1_id === user.id.toString() ? data.player2_name : data.player1_name
                isPlayer1.current = player1_id === user.id.toString()
                setOpponentName(opponent_name)
                battleId.current = data.battle_id
                let response_data = data.questions
                setGameState("Matched")
                setTimeout(() => {
                    SetQuestions(response_data)
                }, 5000)
            } else if (data.type === "progress") {
                if (data.player !== user.id) {
                    setOpponentIndex(data.progress)
                    setOpponentScore(data.score)
                    opponentScoreRef.current = data.score
                }
            } else if (data.type === "result") {
                if (data.player === user.id) {
                    // opponent has not finished
                    if (!isOpponentFinished.current) {
                        setGameState("Waiting")
                    } else {
                        sendEndSessionRequest(opponent_name)
                    }
                } else { // this message is from opponent
                    isOpponentFinished.current = true
                    opponentScoreRef.current = data.score
                    opponentFinishTime.current = data.time
                }
            } else if (data.type === "battle_result") {
                // I ended first, and then opponent ended
                // this message is from opponent
                if (data.sender_id !== user.id) {
                    localStorage.removeItem("inGame")
                    navigate('/battle-result', {
                        state: {
                            myScore: finalScore.current,
                            myTime: isPlayer1.current ? data.time1 : data.time2,
                            opponentName: opponent_name,
                            opponentScore: opponentScoreRef.current,
                            opponentTime: isPlayer1.current ? data.time2 : data.time1,
                            isWin: data.winner_id === user.id
                        }
                    })
                }
            } else if (data.type === "opponent_left") {
                setOpponentLeftMsgVisible(true)
                setTimeout(() =>
                    setOpponentLeftMsgVisible(false), 5000
                )
                isOpponentFinished.current = true
                setIsOpponentLeft(true)
                opponentFinishTime.current = formatDate(new Date())
                // After I finish, the opponent leaves and sends a message
                if (finalScore.current !== -1) {
                    sendEndSessionRequest(opponent_name)
                }
            }
        }
        const handleUnload = () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
            localStorage.removeItem("inGame");
        };
        window.addEventListener("beforeunload", handleUnload);
        return () => {
            handleUnload();
            window.removeEventListener("beforeunload", handleUnload);
        }
    }, []);

    function sendEndSessionRequest(opponent_name) {
        // the opponent has left or finished first, I finish later
        // send end session request and send result to opponent
        let request = {
            player_1_endtime: isPlayer1.current ? formatDate(new Date()) : opponentFinishTime.current,
            player_2_endtime: isPlayer1.current ? opponentFinishTime.current : formatDate(new Date()),
            player_1_score: isPlayer1.current ? finalScore.current : opponentScoreRef.current,
            player_2_score: isPlayer1.current ? opponentScoreRef.current : finalScore.current,
            session_id: battleId.current
        }
        fetchWithAuth("/end_battle", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify(request)
        }, auth)
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    let time1 = data.player_1_time / 1000;
                    let time2 = data.player_2_time / 1000;
                    time1 = time1 < 5 ? 0 : time1 - 5;
                    time2 = time2 < 5 ? 0 : time2 - 5;
                    let isWin = data.winner_id === user.id;
                    socketRef.current.send(JSON.stringify({
                        action: 'battle_result',
                        time1: time1,
                        time2: time2,
                        score1: request.player_1_score,
                        score2: request.player_2_score,
                        winner_id: data.winner_id,
                        sender_id: user.id,
                    }));
                    localStorage.removeItem("inGame")
                    navigate('/battle-result', {
                        state: {
                            myScore: finalScore.current,
                            myTime: isPlayer1.current ? time1 : time2,
                            opponentName: opponent_name,
                            opponentScore: opponentScoreRef.current,
                            opponentTime: isPlayer1.current ? time2 : time1,
                            isWin: isWin,
                        }
                    });
                } else {
                    console.error("Failed to end battle:", res.status);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    function SetQuestions(response_data) {
        response_data.forEach((question) => {
            let options = []
            options.push(question.option_1)
            options.push(question.option_2)
            options.push(question.option_3)
            let randomIndex = getRandomInt(0, 3)
            options.splice(randomIndex, 0, question.answer)
            question.options = options
        })
        setQuestions(response_data)
        setGameState("InGame")
        setTimeLeft(20)
    }

    useEffect(() => {
        if (timeLeft === -1) {
            return
        }
        if (timeLeft === 0) {
            handleNextQuestion(score)
        } else if (!answered) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [timeLeft, answered])

    const handleAnswer = (selectedAns) => {
        const correctAns = questions[index].answer
        let tmp = score
        if (selectedAns === correctAns) {
            setScore(score => score + 10)
            tmp += 10
        }
        setAnswered(true)
        setTimeout(() => handleNextQuestion(tmp), 500)
    }

    const handleShuffleAnswer = (isCorrect) => {
        let tmpScore = score
        if (isCorrect) {
            setScore(score => score + 10)
            tmpScore += 10
        }
        setAnswered(true)
        setTimeout(() => handleNextQuestion(tmpScore), 500)
    }

    const handleNextQuestion = (tmpScore) => {
        socketRef.current.send(JSON.stringify({
            player: user.id,
            progress: index + 1,
            score: tmpScore,
            action: 'progress_update'
        }))
        if (index < questions.length - 1) {
            setIndex((index) => index + 1)
            setTimeLeft(20)
            setAnswered(false)
        } else {
            finalScore.current = tmpScore
            socketRef.current.send(JSON.stringify({
                player: user.id,
                action: 'complete',
                score: tmpScore,
                time: formatDate(new Date())
            }))
        }
    }

    return (
        <div>
            {opponentLeftMsgVisible && (
                <div className="alert alert-warning text-center mt-3"
                     style={{width: "65%", margin: "10px auto auto"}}>
                    Your opponent has left the game!
                </div>
            )}
            {gameState === "Matching" ? (
                localStorage.getItem("inGame") === null ? (<PreBattle/>) : (<RepeatGame/>)
            ) : gameState === "Matched" ? (
                <PreGame opponentName={opponentName}/>
            ) : (
                <div className="game_container">

                    <h2 className="mt-4 fw-bolder text-center fs-1 title">Game Battle</h2>

                    <div className="fs-4 time">Time Left: <strong>{timeLeft}</strong></div>

                    {gameState === "Waiting" && <WaitResult/>}

                    <div className="progress-container mt-3">
                        <div className="left text-center fs-4 fw-bold">{user.name}</div>
                        <div className="text-center battle_center">
                            <div className="fs-3 fw-bold">{score} : {opponentScore}</div>
                            <div className="d-flex justify-content-between mt-2">
                                <div className="progress game_process">
                                    <div className="progress-bar custom-progress-bar " role="progressbar"
                                         style={{
                                             width: (index === questions.length - 1 && (answered || timeLeft === 0)) ?
                                                 '100%' : `${index * 10}%`
                                         }}></div>
                                </div>
                                <div className="progress game_process right_game_process">
                                    <div className="progress-bar custom-progress-bar " role="progressbar"
                                         style={{width: `${opponentIndex * 10}%`}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="right justify-content-center align-items-center fs-4 fw-bold">
                            <div>{opponentName}</div>
                            {isOpponentLeft && <div className="text-danger ms-2">(left)</div>}
                        </div>
                    </div>
                    {
                        questions[index].question.startsWith("Please figure out") ? (
                            <ShuffleQuestion question={questions[index].question}
                                             idiom={questions[index].answer}
                                             onAnswer={handleShuffleAnswer}
                                             timeLeft={timeLeft}/>
                        ) : (
                            <Questions question={questions[index].question} options={questions[index].options}
                                       correctAns={questions[index].answer} onAnswer={handleAnswer}
                                       timeLeft={timeLeft}/>
                        )
                    }
                </div>
            )}
        </div>
    )
}

export default BattleGame;
