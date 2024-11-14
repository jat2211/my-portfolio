import React, { useState, useEffect } from 'react';
import './Home.css';

function Home() {
    const [message, setMessage] = useState("hello!");

    useEffect(() => {
        const timeout = setTimeout(() => {
            setMessage("photo stuff. maybe more.");
        }, 3000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="home-container">
            <div className="hero">
                <div className="hero-content">
                    <h1>{message}</h1>
                    <p>photo stuff. maybe more.</p>
                </div>
            </div>
            <section className="about">
                <h2>jay.</h2>
                <p>
                    multimedia artist, photographer, and programmer.
                </p>
            </section>
        </div>
    );
}

export default Home;
