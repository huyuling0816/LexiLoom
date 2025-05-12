import React from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";
import idiomBg from "../../assets/idioms-background.png";

function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <div
                className="hero-section position-relative band"
                style={{
                    position: "relative",
                    overflow: "hidden",
                    height: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(to right, #D7FBDB, #a5c5ff)",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${idiomBg})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.8,
                        zIndex: 1,
                    }}
                ></div>
                <div className="container-fluid text-center" style={{ position: "relative", zIndex: 2 }}>
                    <h2 className="main-title">Discover the Charm of Chinese Idioms!</h2>
                    <button
                        className="btn btn-primary start-btn"
                        onClick={() => navigate("/flash-card")}
                    >
                        Start Learning
                    </button>
                </div>
            </div>

            <div className="row justify-content-center text-center flex-wrap buttons-container">
                <div className="col-sm-6 col-md-2 d-flex justify-content-center mb-3">
                    <button className="btn text-white home-btn btn-flash" onClick={() => navigate("/flash-card")}
                        style={{ backgroundColor: "#77d1c1" }}>
                        Flash Cards
                    </button>
                </div>
                <div className="col-sm-6 col-md-2 d-flex justify-content-center mb-3">
                    <button className="btn text-white home-btn btn-battle" onClick={() => navigate("/battle-game")}
                        style={{ backgroundColor: "#0097b2" }}>
                        Game Battle
                    </button>
                </div>
                <div className="col-sm-6 col-md-2 d-flex justify-content-center mb-3">
                    <button className="btn text-white home-btn btn-test" onClick={() => navigate("/pre-test")}
                        style={{ backgroundColor: "#004aad" }}>
                        Self Test
                    </button>
                </div>
                <div className="col-sm-6 col-md-2 d-flex justify-content-center mb-3">
                    <button className="btn text-white home-btn btn-search" onClick={() => navigate("/search")}
                        style={{ backgroundColor: "#5e19cf" }}>
                        Search Idioms
                    </button>
                </div>
                <div className="col-sm-6 col-md-2 d-flex justify-content-center mb-3">
                    <button className="btn text-white home-btn btn-collection" onClick={() => navigate("/collection")}
                        style={{ backgroundColor: "#8c52ff" }}>
                        My Idioms
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;


