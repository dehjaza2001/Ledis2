import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { TerminalContextProvider } from "react-terminal";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <TerminalContextProvider>
      <App />
  </TerminalContextProvider>
);


