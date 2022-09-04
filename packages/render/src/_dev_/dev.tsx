import React from 'react';
import ReactDOM from 'react-dom/client';
import { BasePage } from '@chameleon/demo-page';
import { getRenderComponent, ReactAdapter } from '../index';
import '@chameleon/material/dist/style.css';
import './index.css';

export type AppPRops = {
  a: string;
};

const Render = getRenderComponent(new ReactAdapter());
function App() {
  return (
    <div className="App">
      <Render page={BasePage} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
