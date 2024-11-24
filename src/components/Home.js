import React from 'react';
import ChatInterface from './ChatInterface';
import './Home.css';

const Home = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#000000'
    }}>
      <ChatInterface />
    </div>
  );
};

export default Home;
