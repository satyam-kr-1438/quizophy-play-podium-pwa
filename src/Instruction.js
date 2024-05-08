"use client"

import React, { useEffect } from 'react'
import { useState } from 'react'
import "../src/css/Instruction.css"
import 'animate.css';
import axios from "axios"
import { APIURL, playUrl } from './Apiurl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useCommonData } from './Context'
import AnimateBg from './Animation/AnimateBg';
import seeName from "../src/img/rabbit.gif"
import Swal from 'sweetalert2';
import { toast ,ToastContainer} from 'react-toastify';
import Cookies from 'js-cookie';
import "react-circular-progressbar/dist/styles.css";
import { ConnectionLost } from './ConnectionLost';

const Instruction = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [pleaseWait,setPleaseWait]=useState(false)
  const { pin, setQuiz,setUser,setPin,user,index ,setIndex} = useCommonData()
  const [change,setChange]=useState(false)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isInBackground, setIsInBackground] = useState(false);
  useEffect(() => {
    if (!pin?.id && !user?.id && !JSON?.parse(localStorage?.getItem("quizophyPodiumQuizRejoinCredentials")) && !JSON?.parse(sessionStorage?.getItem("quizophyPodiumQuizRejoinCredentialsSession"))) {
      navigate(`/`)
    }
    if(!pin?.id && !user?.id){
        setTimeout(()=>{
          const playInfo = Cookies?.get('quizophyPodiumQuizRejoinCredentials') ? JSON.parse(Cookies?.get('quizophyPodiumQuizRejoinCredentials')): ""
          const getLocalStorageData=JSON?.parse(localStorage?.getItem("quizophyPodiumQuizRejoinCredentials"))
          const getSessionStorageData=JSON?.parse(sessionStorage?.getItem("quizophyPodiumQuizRejoinCredentialsSession"))
          if(getLocalStorageData || playInfo || getSessionStorageData){
            if(getLocalStorageData){
              getPlayerRejoinCredentials(getLocalStorageData)
            }
            else if(playInfo){
              getPlayerRejoinCredentials(playInfo)
            }
            else if(getSessionStorageData){
              getPlayerRejoinCredentials(getSessionStorageData)
            }
          }
        },1000)
    }
    
  }, [])
  useEffect(()=>{
    const onConfirmRefresh =async function (event) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave the page?';
   }

   window.addEventListener('beforeunload', onConfirmRefresh, { capture: true })

   return () => {
     window.removeEventListener('beforeunload', onConfirmRefresh)
   }
 },[])
 

  useEffect(() => {
    if (pin?.id) {
      window.history.pushState(null, '', location.pathname + location.search)
      window.addEventListener('popstate', onBackButtonEvent)
    }
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent)
    }
  }, [])



  const fetchData=async ()=>{
    axios.get(`${APIURL}/checkQuizStatusStartedOrNot/${pin?.id}/${pin?.pin}`).then(({data})=>{
      if(data?.message=="Started" && window?.location?.pathname=="/instruction"){
        getQuiz(data?.key)
      }
      if(data?.message=="Admin quit the quiz" && window?.location?.pathname=="/instruction"){        
        adminQuizTheQuiz()
      }
    }).catch((error) => {
      if (axios.isAxiosError(error)) {
        // Axios-specific error
        if (error.code === 'ECONNABORTED') {
            if(pin?.id && pin?.pin){
              fetchData()
            }
        } else {
          if(pin?.id && pin?.pin){
            fetchData()
          }
        }
      } else {
        if(pin?.id && pin?.pin){
          fetchData()
        }
      }
    })
  }

  useEffect(()=>{
      let interval12=setInterval(()=>{
        if(pin?.id && pin?.pin){
          fetchData() 
        }
      },5000)
      return ()=>{
        clearInterval(interval12)
      }
  },[setChange,change])
  useEffect(()=>{
    if(pin?.id && pin?.pin){
        fetchData() 
    }
  },[change,setChange])

  useEffect(() => {
    const handleOnlineStatus = () => {
      setTimeout(()=>{
        navigate("/")
     },2000)
    };
    const handleOfflineStatus = () => {
      setIsOnline(false);
    };

    // Add event listeners for online and offline events
    window?.addEventListener('online', handleOnlineStatus);
    window?.addEventListener('offline', handleOfflineStatus);

    // Clean up event listeners on component unmount
    return () => {
      window?.removeEventListener('online', handleOnlineStatus);
      window?.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);
  
  

  useEffect(() => {
    const handleVisibilityChange = () => {
      if(document?.hidden){
        setIsInBackground(true)
      }
      if(!document.hidden){
          navigate("/")
      }
    };
    // Add event listener for visibility change
    document?.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up event listener on component unmount
    return () => {
      document?.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getPlayerRejoinCredentials=async (...rest)=>{
    try{
      let data;
       if(rest?.length>0){
        let name=rest[0].name
        let quizPin=rest[0].pin
        data=await axios.get(`${APIURL}/get-player-credential-to-rejoin/${name.trim()}/${quizPin}`)
       }
      let data2=data.data
      if(data2.success){
        if(JSON.parse(data2.data.userData)){
          setUser(JSON.parse(data2.data.userData))
        }
        if(JSON.parse(data2.data.pinData)){
          setPin(JSON.parse(data2.data.pinData))
        }
        setChange(!change)
      }
      else{
        navigate("/")
      }
    }catch(error){
      navigate("/")
    }      
  }
  const setPlayerQuizRejoin=async ()=>{
    if(user?.id && pin?.id){
      const {data}=await axios.post(`${APIURL}/player-details-to-rejoin-quiz`,{pinData:JSON.stringify(pin),userData:JSON.stringify(user),questionIndex:index,user_id:user?.id,quizPinId:pin?.id})
    }
  }
  useEffect(()=>{
    setPlayerQuizRejoin()
  },[])


  const removeUserFromGame=async ()=>{
      Swal.fire({
        text:"Do You Want to Quit the Quiz",
        showCancelButton: true,
        icon:"warning",
      }).then(async (result) => {
        if (result.isConfirmed) {
          if(user && user.nickname && pin && pin.id){
            const data=await axios.delete(`${APIURL}/quit-quiz/${pin.id}/${user.nickname}`)
            if(data.data.success){
              Cookies.remove('quizophyPodiumQuizRejoinCredentials')
              localStorage.removeItem("quizophyPodiumQuizRejoinCredentials")
              sessionStorage.removeItem("quizophyPodiumQuizRejoinCredentialsSession")
              window.location.pathname="/"
             }
          }           
        }
      })
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

  const onBackButtonEvent = async(e) => {
    if (e.state) {
      if (window.confirm('Do you want to go back ?')) {
        // navigate(`/`)
        const data=await axios.delete(`${APIURL}/quit-quiz/${pin.id}/${user.nickname}`)
          if(data.data.success){
            window.location.pathname="/"
           }
      } else {
        window.history.pushState(null, '', `/instruction${location.search}`)
      }
    }
  }

  const getQuiz = (key) => {
    const request = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    }
    fetch(`${APIURL}/get-quiz-details/${key}`, request)
      .then(data => data.json())
      .then(data => {
        if (data.data) {
          setQuiz(data.data)
          sessionStorage.setItem("quizophyPodiumQuizRejoinCredentialsSession",JSON.stringify({pin_id:pin?.id,user_id:user?.id,pin:pin?.pin,quiz_id:data?.data?.id,quiz_key:data?.data?.key,name:user?.nickname}))
          localStorage.setItem("quizophyPodiumQuizRejoinCredentials",JSON.stringify({pin_id:pin?.id,user_id:user?.id,pin:pin?.pin,quiz_id:data?.data?.id,quiz_key:data?.data?.key,name:user?.nickname}))
          navigate("/start")
        }
      })
      .catch(err => {
        console.log(err, 'err')
      })
  }
  

  return (
    <div className='App ins_bg'>
      <AnimateBg/>
      {/* Quit Button  */}
      {
        pleaseWait || !isOnline || isInBackground ? <div  className='text-start' style={{position:"absolute"}}>
               <ConnectionLost/>
          </div> :<>
          <div style={{position:"fixed",top:"10px",right:"10px",zIndex:"9999999"}}>
          {/* <button className="game_start_quit_quiz_btn2 me-2" onClick={(e)=>{
            e.preventDefault()
            callAnotherApi("start forcefully")
         }}>Start Now</button> */}
         <button className="game_start_quit_quiz_btn2" onClick={(e)=>{
            e.preventDefault()
            removeUserFromGame()
         }}>Quit Quiz</button>
      </div>
      <div className='my_element animate__animated animate__zoomInDown animate_slow'>
        <h1 className="YouAreIn" style={{fontSize:"50px",fontWeight:"600",color:"white"}}>You're in</h1>
        <h6 className='instru-heading' style={{fontSize:"30px",color:"white",padding:"3px 10px"}}>See your nickname on screen</h6>
        <img style={{width:"220px",height:"270px",marginTop:"20px"}} src={seeName}/>
    
      </div>
          </>
      }
   
    </div>
  )
}

export { Instruction }
