// App.js
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import "./App.css";
import SpeechToChatGPT from "./components/SpeechToChatGPT";
import SpeechToChatGPTEng from "./components/SpeechToChatGPTEng";
import SpeechToChatGPTCooking from "./components/SpeechToChatGPTCooking";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpeechToChatGPTCooking />} />
        <Route path="/english" element={<SpeechToChatGPTEng />} />
        <Route path="/talk" element={<SpeechToChatGPT />} />
        {/* URL直接入力時に"/"にリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
