import React from 'react';
import ReactDOM from 'react-dom/client';
import { Render } from '../index';
import './index.css';

export type AppPRops = {
  a: string;
};

function App() {
  return (
    <div className="App">
      Hello world
      <Render />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
