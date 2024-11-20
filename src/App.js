import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home'; // Ensure this is where the game is going
import Portfolio from './components/Portfolio';
import Blog from './components/Blog';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/portfolio" data-text="photography">photography</Link>
            </li>
            <li>
              <Link to="/">
                <img src="/signature.png" alt="jay trevino" style={{ width: '100px', height: '50px' }} />
              </Link>
            </li>
            <li>
              <Link to="/blog" data-text="writing">writing</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

