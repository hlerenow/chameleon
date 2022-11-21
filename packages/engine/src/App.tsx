import React, { useState } from 'react';
import { Button, ConfigProvider } from 'antd';
import './App.scss';

export type AppPRops = {
  a: string;
};

function App() {
  const [count, setCount] = useState(0);

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 2,
          colorPrimary: '#ea5b1d',
        },
      }}
    >
      <div className="App">
        <Button onClick={() => setCount((el) => el + 1)} type="primary">
          Hello world {count}
        </Button>
      </div>
    </ConfigProvider>
  );
}

export default App;
