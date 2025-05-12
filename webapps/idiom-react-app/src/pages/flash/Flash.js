import React, {useState, useEffect} from "react";
import {getCSRFToken} from "../../utils/utils";
import "./Flash.css";
import {useAuth} from "../../store/authContext";
import {fetchWithAuth} from "../../utils/fetchWithAuth";

function Flash() {
    const auth = useAuth();
    const [flipped, setFlipped] = useState(false);
    const [idiom, setIdiom] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [tooltips, setTooltips] = useState({});

    function fetchIdiom() {
        fetchWithAuth("/get_random_idiom", {
            method: "GET",
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            }
        }, auth)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log("idiom fetched:", data);
                setIdiom(data);
                setFlipped(false);
            })
            .catch((error) => {
                console.error("Failed to fetch idiom:", error);
            });
    }

    function toggleFavorite() {
        const url = idiom.is_collected ? "/remove_from_collection" : "/add_to_collection";
        const action = idiom.is_collected ? "remove" : "add";

        fetchWithAuth(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({idiom_id: idiom.id}),
        }, auth).then((res) => {
            if (res.ok) {
                setIdiom({...idiom, is_collected: !idiom.is_collected});
            } else {
                alert(`Failed to ${action}.`);
            }
        });
    }

    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        speechSynthesis.speak(utterance);
    }

    function handleCharClick(char, index) {
        if (activeIndex === index) {
            setActiveIndex(null);
            return;
        }
        fetchWithAuth(`/translate/${encodeURIComponent(char)}/`, {}, auth)
            .then(res => res.json())
            .then(data => {
                console.log("Translation data:", data.translation);
                setTooltips(prev => ({...prev, [index]: data.translation || "No translation"}));
                setActiveIndex(index);
            })
            .catch(() => {
                setTooltips(prev => ({...prev, [index]: "Bad Request"}));
                setActiveIndex(index);
            });
    }

    useEffect(() => {
        fetchIdiom();
    }, []);

    useEffect(() => {
        const handler = () => setActiveIndex(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);


    const handleFlip = () => setFlipped(!flipped);

    if (!idiom) return <div></div>;

    return (
        <div className="container">
            <div className="text-center mt-5">
                <div className="card-wrapper">
                    <div
                        className={`flip-card ${flipped ? "flipped" : ""}`}
                        onClick={handleFlip}
                    >
                        <div className="flip-card-inner">
                            <div className="flip-card-front text-white flash-card">
                                <h2>{idiom.pronunciation}</h2>
                                <h1>{idiom.idiom}</h1>
                            </div>
                            <div className="flip-card-back text-white flash-card">
                                <h2>{idiom.pronunciation}</h2>
                                <div className="idiom-characters">
                                    {idiom.idiom.split("").map((char, index) => (
                                        <div
                                            key={index}
                                            className={`idiom-char ${activeIndex === index ? "active" : ""}`}
                                            onMouseEnter={() => setHoveredIndex(index)}
                                            onMouseLeave={() => {
                                                setHoveredIndex(null);
                                                setActiveIndex(null);
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCharClick(char, index);
                                            }}
                                        >
                                            <span>{char}</span>

                                            {activeIndex === index && tooltips[index] && (
                                                <div className="hint">{tooltips[index]}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="btn speak text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        speak(idiom.idiom);
                                    }}
                                >
                                    📢 Read
                                </button>
                                <h1>{idiom.translation}</h1>
                                <p>Explanation: {idiom.explanation}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 d-flex justify-content-center gap-5 btn-container">

                    <button
                        className={`btn fav ${idiom.is_collected ? "btn-danger" : "fav"}`}
                        onClick={toggleFavorite}
                    >
                        {idiom.is_collected ? "Remove from Favorites" : "Add to Favorites"}
                    </button>

                    <button
                        className="btn next"
                        onClick={() => {
                            if (flipped) {
                                setFlipped(false);
                                setTimeout(() => {
                                    fetchIdiom();
                                }, 400);
                            } else {
                                fetchIdiom();
                            }
                        }}
                    >
                        Next
                    </button>

                </div>
            </div>
        </div>
    );
}

export default Flash;

