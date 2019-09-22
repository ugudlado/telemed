import React from 'react';
import './App.css';
import Header from './components/Header';
import Demo from './components/Demo';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header/>
      <Demo/>
    </div>
  );
}

export default App;