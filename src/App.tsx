import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './components/Home'
import Room from './components/Room'
import {Routes, Route} from 'react-router-dom'


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/room" element={<Room/>}/>
    </Routes>
  );
}

export default App;
