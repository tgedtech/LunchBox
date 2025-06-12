import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Hello Tailwind!</h1>
      <p className="text-lg text-gray-700">Tailwind is working perfectly 🚀</p>
      <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
        Test Button
      </button>
    </div>
  );
}

export default App;
