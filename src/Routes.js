import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Join } from './Join'
import { Instruction } from './Instruction'
import { Start } from './Start'
import { GameStart } from './GameStart'
import App from './App'
import Answer from './Answer'
import Ranking from './Ranking'
import ViewQuizResult from './ViewQuizResult'
import { ConnectionLost } from './ConnectionLost'
const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'  element={<App />} />
        <Route path=':id'  element={<Join />} />
        <Route path='instruction'  element={<Instruction />} />
        <Route path='start' element={<Start />} />
        <Route path='game-start'  element={<GameStart />} />
        <Route path='answer'  element={<Answer />} />
        <Route path='ranking'  element={<Ranking />} />
        <Route  path='quiz-result/:quiz_id/:pin_id' element={<ViewQuizResult />} />
        <Route path='*'  element={<Navigate to="/"/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default Router
