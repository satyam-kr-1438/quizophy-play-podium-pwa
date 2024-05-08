import logo from './logo.svg'
import './App.css'
import { useState } from 'react'
import { APIURL } from './Apiurl'
import { useNavigate } from 'react-router-dom';
import { useCommonData } from './Context';
import { Join } from './Join';
import { ToastContainer } from 'react-toastify';

function App () {
  const [pin, setPin] = useState('')
  const navigate = useNavigate()
  const [error, showError] = useState(false)

  return (
    <>
    <Join />
    <ToastContainer />
    </>
    
  )
}

export default App
