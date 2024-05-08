import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './App.css'
import reportWebVitals from './reportWebVitals'
import Router from './Routes'
import { CommonDataProvider } from './Context'
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <CommonDataProvider>
       <Router />
  </CommonDataProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
