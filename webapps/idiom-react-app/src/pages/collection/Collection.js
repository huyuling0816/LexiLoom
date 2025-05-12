import React, { useEffect, useState } from "react";
import {getCSRFToken} from "../../utils/utils";
import "./Collection.css";
import {fetchWithAuth} from "../../utils/fetchWithAuth";
import {useAuth} from "../../store/authContext";

function Collection() {
    const auth = useAuth();
    const [idioms, setIdioms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 3;

    const fetchCollection = (page) => {
        fetchWithAuth(`/get_my_collection?page=${page}&items_per_page=${itemsPerPage}`,{}, auth)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    // alert(data.error);
                    return;
                }
                setIdioms(data.idioms);
                setCurrentPage(data.current_page);
                setTotalPages(data.total_pages);
            });
    };

    useEffect(() => {
        fetchCollection(currentPage);
    }, []);

    const removeFromFavorites = (id) => {
        fetchWithAuth("/remove_from_collection", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken(),
            },
            body: JSON.stringify({ idiom_id: id }),
        }, auth).then((res) => {
            if (res.ok) {
                fetchCollection(currentPage); 
            } else {
                // alert("Failed to remove.");
            }
        });
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchCollection(page);
        }
    };

    return (
        <div className="collection-container">
            <h1 className="text-center mt-4 mb-4 fw-bold">My Idioms</h1>

            <div className="idiom-list">
                {idioms.length === 0 ? (
                    <div className="no-collection-msg" style={{ color: "gray", textAlign: "center", marginTop: "2rem" }}>
                        You have no collected idioms yet.
                    </div>
                ) : (
                    idioms.map((idiom) => (
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
                                    className="btn small-btn danger"
                                    onClick={() => removeFromFavorites(idiom.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>


            <div className="pagination d-flex justify-content-center mt-4">
                <button
                    className="btn small-btn me-2"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                >
                    Prev
                </button>
                {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                        <button
                            key={page}
                            className={`btn small-btn me-2 ${page === currentPage ? "active" : ""}`}
                            onClick={() => goToPage(page)}
                        >
                            {page}
                        </button>
                    );
                })}
                <button
                    className="btn small-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Collection;
