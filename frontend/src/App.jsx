import { useState } from 'react'
import './App.css'
import { app, auth, db } from './firebase/firebase'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>MediaHub</h1>
    </>
  )
}

export default App
