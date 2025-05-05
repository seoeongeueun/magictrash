import { useState } from 'react'
import DropZone from './components/DropZone'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
        <DropZone/>
      </div>
  )
}

export default App
