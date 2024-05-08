import React, { useEffect } from 'react'
import { useState } from 'react'
import "../src/css/Instruction.css"
import 'animate.css';
import Cookies from 'js-cookie';

import { useLocation, useNavigate } from 'react-router-dom'
import { APIURL } from './Apiurl'
import { useCommonData } from './Context'
import AnimateBg from './Animation/AnimateBg';
import Swal from 'sweetalert2';
import axios from 'axios';
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ConnectionLost } from './ConnectionLost';

const Start = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [count, setCount] = useState(3)
  const { pin,user,setPin,setUser,setQuiz,quiz,index,setIndex } = useCommonData()
  const [pleaseWait,setPleaseWait]=useState(false)
  const [change,setChange]=useState(false)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isInBackground, setIsInBackground] = useState(false);
  useEffect(() => {
    if (!pin?.id && !user?.id) {
      navigate(`/`)
    }
  }, [])

  const checkUpdatedStatus=async ()=>{
    const {data}=await axios.get(`${APIURL}/checkCurrentPinStatusActive/${pin?.id}`)
    if(data?.success){
      adminQuizTheQuiz()
    }
  }
  const adminQuizTheQuiz=async ()=>{
    if(pin?.id && user?.nickname){
      const data=await axios.delete(`${APIURL}/quit-quiz/${pin.id}/${user.nickname}`)
      if(data.data.success){
        Cookies.remove('quizophyPodiumQuizRejoinCredentials')
        localStorage.removeItem("quizophyPodiumQuizRejoinCredentials")
        sessionStorage.removeItem("quizophyPodiumQuizRejoinCredentialsSession")
        setPin(undefined)
        setUser(undefined)
        setQuiz(undefined)
        window.location.reload()
       }
    }   
  }

  useEffect(()=>{
    let interrr=setInterval(()=>{
        if(pin?.id)
         checkUpdatedStatus()
    },1000)
    
    return()=>{
      clearInterval(interrr)
    }
  },[isInBackground,isOnline])

  useEffect(() => {
    const handleOnlineStatus = () => {
      // setIsOnline(true);
      setTimeout(()=>{
        setIsOnline(true);
      },1000)
    };

    const handleOfflineStatus = () => {
      setIsOnline(false);
    };

    // Add event listeners for online and offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);
  
  const handleVisibilityChange = () => {
    if(document?.hidden){
      setIsInBackground(true)
    }
    if(!document?.hidden){
      setIsInBackground(false)
    }
  };

  useEffect(() => {
    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [])


  const setPlayerQuizRejoin=async ()=>{
    const {data}=await axios.post(`${APIURL}/player-details-to-rejoin-quiz`,{quizData:JSON.stringify(quiz),pinData:JSON.stringify(pin),userData:JSON.stringify(user),questionIndex:index,user_id:user?.id,quizPinId:pin?.id})
  }

  const removeUserFromGame=async ()=>{
    Swal.fire({
      text:"Do You Want to Quit the Quiz",
      showCancelButton: true,
      icon:"warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if(user && user.nickname && pin && pin.id){
          setPlayerQuizRejoin()
          const data=await axios.delete(`${APIURL}/quit-quiz/${pin.id}/${user.nickname}`)
          if(data.data.success){
            Cookies.remove('quizophyPodiumQuizRejoinCredentials')
            localStorage.removeItem("quizophyPodiumQuizRejoinCredentials")
            sessionStorage.removeItem("quizophyPodiumQuizRejoinCredentialsSession")
            window.location.pathname="/"
            // navigate("/")
           }
 
     }
         
      }
    })
    }


    useEffect(()=>{
      setPlayerQuizRejoin()
    },[])

  useEffect(() => {
    if (count == 0) {
      setTimeout(() => {        
        navigate(`/game-start`,{state:{timer:Number(quiz?.questions[0].time_limit.split(' ')[0])}})
      }, 1000);
    }
    let timer =
      count > 0 && setInterval(() => setCount(count - 1), 1000)
    return () => clearInterval(timer)
  }, [count])


  return (
    <div className='App ins_bg'>
      <AnimateBg/>
      {/* Quit Button  */}
      {
          pleaseWait || !isOnline || isInBackground ? <div  className='text-start' style={{position:"absolute",zIndex:"9999999"}}>
           <ConnectionLost/>
       </div>:<>
       <div style={{position:"fixed",top:"10px",right:"10px",zIndex:"9999999"}}>
         <button className="game_start_quit_quiz_btn2" onClick={(e)=>{
           e.preventDefault()
           removeUserFromGame()
         }}>Quit Quiz</button>
      </div>

      <div className=' animate__animated animate__zoomIn animate__infinite	infinite animate__slow 0.4s'>

   
      <h1 style={{fontSize:"200px",fontWeight:"600",color:`white`}} >{count == 0 ? 'Go' : count}</h1>
      </div>
       </>
      }
    
    </div>
  )
}

export { Start }
