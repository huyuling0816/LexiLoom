import React, {useState} from "react";
import "../collection/Collection.css";
import {getCSRFToken} from '../../utils/utils';
import "./Search.css";
import {fetchWithAuth} from "../../utils/fetchWithAuth";
import {useAuth} from "../../store/authContext";

function Search() {
    const auth = useAuth();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const searchIdioms = () => {
        if (!query.trim()) return;
        setLoading(true);
        setErrorMessage("");
        fetchWithAuth(`/search_idioms?description=${encodeURIComponent(query)}`, {}, auth)
            .then((res) => {
                if (res.status === 401) {
                    localStorage.removeItem("user");
                    alert("Session expired or you have logged in somewhere else.");
                    window.location.href = "/login";
                }
                return res.json()
            })
            .then((data) => {
                setResults(data.results || []);
                setErrorMessage(data.error || "");
                setLoading(false);
            }).catch((err) => {
            setResults([]);
            setErrorMessage("No idioms found matching your description.");
            setLoading(false);
        });
    };

    const toggleFavorite = (id) => {
        const idiom = results.find(item => item.id === id);
        const isCollected = idiom?.is_collected;

        const url = isCollected ? "/remove_from_collection" : "/add_to_collection";

        fetchWithAuth(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({idiom_id: id}),
        }, auth).then((res) => {
            if (res.ok) {
                const updated = results.map(item =>
                    item.id === id ? {...item, is_collected: !isCollected} : item
                );
                setResults(updated);
            } else {
                alert(`Failed to ${isCollected ? "remove" : "add"}.`);
            }
        });
    };

    return (
        <div className="collection-container">
            <h1 className="text-center mt-4 mb-4 fw-bold">Search Idioms</h1>

            <div className="d-flex justify-content-center mb-4">
                <div className="search-bar">
                    <input
                        type="text"
                        className="form-control w-100 me-2"
                        placeholder="Enter a description (e.g. teamwork, never give up)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <button className="btn btn-primary" onClick={searchIdioms}>
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>
            </div>

            <div className="idiom-list">
                {results.map((idiom) => (
                    <div className="idiom-card" key={idiom.id}>
                        <div className="idiom-left">
                            <div className="idiom-pron">{idiom.pronunciation}</div>
                            <div className="idiom-text">{idiom.idiom}</div>
                        </div>
                        <div className="idiom-middle">
                            <div className="idiom-translation"><b>{idiom.translation}</b></div>
                            <div className="idiom-explanation">{idiom.explanation}</div>
                        </div>
                        <div className="idiom-actions">
                            <button
                                className={`btn small-btn ${idiom.is_collected ? "btn-danger" : ""}`}
                                onClick={() => toggleFavorite(idiom.id)}
                            >
                                {idiom.is_collected ? "Remove" : "Favorite"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {errorMessage && (
                <div className="text-center text-fail my-3">{errorMessage}</div>
            )}
        </div>
    );
}

export default Search;
