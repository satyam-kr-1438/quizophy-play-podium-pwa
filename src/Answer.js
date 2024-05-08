import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import incorrect from "../src/img/incorrect.gif"
import correctgif from "../src/img/correct_gif.gif"
import wrongif from "../src/img/wronggif.gif"
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import correct from "../src/img/correct.gif"
import quizophyLogo from "../src/img/Quizophy-logo.png"
import wrong from "../src/img/wrong.mp3"
import correctAudio from "../src/img/correctAudio.mp3"
import "../src/css/Instruction.css"
import 'animate.css';
import Cookies from 'js-cookie';

import { APIURL, playUrl } from './Apiurl'
import { useCommonData } from './Context'
import AnimateBg from './Animation/AnimateBg';
import Swal from 'sweetalert2'
import axios from 'axios'
import { ConnectionLost } from './ConnectionLost'
import { RejoinMessage } from './RejoinMessage'
let interr2;
const Answer = () => {
  const [againEntered,setAgainEntered]=useState()
  const location = useLocation()
  const navigate = useNavigate()
  let user_ans = location?.state?.user_ans
  const { user,pin, quiz, index, setIndex,toneQuiz,setPin,setQuiz,setUser } = useCommonData()
  const [pleaseWait,setPleaseWait]=useState(false)
  const [change,setChange]=useState(false)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isInBackground, setIsInBackground] = useState(false);
 const [countStart,setCountStart]=useState(59)
 const [checkStatus,setCheckStatus]=useState(true)

  useEffect(() => {
    if (!pin?.id && !quiz?.id && !user?.id) {
      navigate(`/`)
    }

    let interr=setInterval(()=>{
       countStart>0 ? setCountStart((pre)=>pre-1):setCountStart(59)
    },1000)

    return ()=>{
      clearInterval(interr)
      clearInterval(interr2)
    }
  }, [setChange,change])


  const fetchApi=async ()=>{
    axios.post(`${APIURL}/checkStatusQuizQuestionAnswer`,{pin_id:pin?.id,pin:pin?.pin,quiz_id:quiz?.id,user_id:user?.id,question_id:quiz?.questions[index]?.id,type:"Answer"}).then(({data})=>{
         if(data?.navigate && data?.message=="Admin quit the quiz" && !data?.success && data?.pin_id==pin?.id && window?.location?.pathname=="/answer"){
          adminQuizTheQuiz()
         }
        if(data?.navigate &&  pin?.id==data?.pin_id && data?.user_id==user?.id && data?.quiz_id==quiz?.id && window?.location?.pathname=="/answer"){
           if(data?.result_declared==1){
              if(data?.path=="result"){
                getResult()
              }else{
                setChange(!change)
              }
           }
           else if(!data?.question_answer_status){
            if(data?.path=="game_start"){
               setIndex(Number(data?.question_number))
               navigate("/game-start",{state:{timer:Number(data?.question_timer)},replace:true})
            }
            else{
              setChange(!change)
            }
          }
        }
    }).catch((error) => {
      if (axios.isAxiosError(error)) {
        // Axios-specific error
        if (error.code === 'ECONNABORTED') {
            if(pin?.id && quiz?.id){
              // fetchData()
              setChange(!change)
            }
        } else {
          setChange(!change)
          console.error('Axios error:', error.message);
        }
      } else {
        setChange(!change)
        // Other types of errors
        console.error('Error:', error.message);
      }
    })

  }

  useEffect(()=>{
    let interr11=setInterval(()=>{
      if(pin?.id && quiz?.id && user?.id ){
        fetchApi()
      }
   },5000)
   return ()=>{
     clearInterval(interr11)
   }
  },[])

  useEffect(()=>{
    let eventSource=undefined
    if(pin?.id && quiz?.id && user?.id ){
      eventSource=setTimeout(()=>{
          fetchApi()
        },1500)
    }
    return ()=>{
      clearTimeout(eventSource)
    }
  },[change,setChange])

  useEffect(() => {
    const handleOnlineStatus = () => {
      setTimeout(()=>{
         setIsOnline(true)
         if(pin?.id && quiz?.id && user?.id ){
          fetchApi()
         }
      },2000)
    };

    const handleOfflineStatus = () => {
      setIsOnline(false);
    };

    window?.addEventListener('online', handleOnlineStatus);
    window?.addEventListener('offline', handleOfflineStatus);

    return () => {
      window?.removeEventListener('online', handleOnlineStatus);
      window?.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);
  
  // const checkUpdatedStatus=async ()=>{
  //   const {data}=await axios.get(`${APIURL}/checkCurrentPinStatusActive/${pin?.id}`)
  //   if(data?.success){
  //     adminQuizTheQuiz()
  //   }
  // }
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

  // useEffect(()=>{
  //   let interrr=setInterval(()=>{
  //       if(pin?.id)
  //        checkUpdatedStatus()
  //   },1000)
    
  //   return()=>{
  //     clearInterval(interrr)
  //   }
  // },[isInBackground,isOnline,change,setChange])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if(document?.hidden){
        setIsInBackground(true)
      }
      if(!document?.hidden){
        setIsInBackground(false)
        if(pin?.id && quiz?.id && user?.id ){
          fetchApi()
         }        
      }
    }
    document?.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document?.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(()=>{
      if(location.state && location.state.message){
        if(location.state.message==="You Are In The Game Again"){
          setAgainEntered(location.state.message)
          user_ans=undefined
        }
        else if(location.state.message==="You Connection Re-established"){
          setAgainEntered(location.state.message)
        }
      }
  },[])



  const getResult = () => {
    const request = {
      method: 'POST',
      body: JSON.stringify({
        quiz_id: quiz?.id,
        id: pin?.id
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    }
    fetch(`${APIURL}/getResult`, request)
      .then(data => data.json())
      .then(data => {
        if (data.data) {
          navigate('/ranking', { state: { result: data.data } })
        }
      })
      .catch(err => {
        console.log(err, 'err')
      })
  }
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
            // navigate("/")
           }
 
     }
         
      }
    })
    }


  return (
    <div className='App ins_bg'>
      <AnimateBg/>
      {/* Quit Button  */}
      <div style={{position:"fixed",top:"10px",right:"10px",zIndex:"9999999"}}>

         <button className="game_start_quit_quiz_btn2" onClick={(e)=>{
             e.preventDefault()
             removeUserFromGame()
         }}>Quit Quiz</button>
      </div>

      {
          againEntered  && <div  className='text-start' style={{position:"absolute",display:"flex",justifyContent:"center",alignItems:"center",height:"90vh",width:"100%"}}>
               <RejoinMessage/>
            </div>
      }
      {
         pleaseWait || !isOnline || isInBackground ?  <div   className='text-start' style={{position:"absolute",zIndex:"9999999",display:"flex",justifyContent:"center",alignItems:"center",height:"90vh",width:"100%"}}>
            <div className="container" style={{height:"100vh",width:"100vw",display:"flex",justifyContent:"center",alignItems:"center"}}>
                <div className="">
                <div className="main-container-connection" style={{background:"#b3c1e8",padding:"20px",maxWidth:"450px",boxSizing:"border-box",minHeight:"200px",borderRadius:"10px",boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px"}}>
                  <div className="" style={{background:"#8ea3dd",borderRadius:"20px"}}>
                      <div className="" style={{maxWidth:"450px"}}>
                        <div className="background_image_connection" style={{margin:"auto",textAlign:"center",maxHeight:"108px"}}>
                            <img src={quizophyLogo} style={{width:"60%",margin:"auto",textAlign:"center",borderRadius: "10px 10px 0px 0px"}}/>
                        </div>
                      </div>
                      <div className="" style={{height:"70%",padding:"0px 15px 15px 15px",borderRadius:"0px 0px 20px 20px"}}>
                        <hr className="hr_color"/>
                        <div>
                          <h2 className="text-white text-center">Please Wait</h2>
                          <h6 className="text-center fs-5" >Your connection lost. We are trying to re-connect your connection.</h6>
                          <p className="text-center fs-6">Please don't turn off your browser or close this tab while we're processing your request.</p>
                        </div>
                        <div className="mx-auto text-center">
                            <button className="btn btn-primary" onClick={()=>{
                               countStart>0 &&  setChange(!change)
                               countStart<=0 && setCountStart(59)
                                // countStart<=0 && startCounting()
                            }}>
                             {countStart>0 ? countStart :"Try Again"}
                            </button>
                        </div>
                      </div>
                  </div>
                </div>
                </div>
            </div>
      </div>  :  <div className=''>
        
        {
          user_ans && user_ans!=="Question Skipped" && toneQuiz && <audio controls autoPlay style={{display:"none"}} >
          <source src={correctAudio} type="audio/mpeg"/>
        </audio> 
        }
        {
         !user_ans && user_ans!="Question Skipped" && toneQuiz &&
          <audio controls autoPlay style={{display:"none"}} >
          <source src={wrong} type="audio/mpeg"/>
        </audio>
        }
        {
         user_ans!=undefined && user_ans!="Question Skipped" &&  !againEntered &&     <img src={user_ans ?correct:incorrect} alt="new image" style={{position:"relative",zIndex:1000,top:"-90px",left:"70px", width:"130px", height:"130px",borderRadius:"100%"}}/>
        }
        {
         user_ans==undefined && user_ans !="Question Skipped" &&  !againEntered &&  <img src={incorrect} alt="new image" style={{position:"relative",zIndex:1000,top:"-30px",left:"0px", width:"130px", height:"130px",borderRadius:"100%"}}/>
        }
          {
            user_ans!=undefined &&  user_ans !="Question Skipped" && !againEntered &&  <img src={user_ans ?correctgif:(user_ans == undefined ?"":wrongif)} alt="new image" style={{position:"relative",zIndex:1000,top:"40px",left:"-70px", width:"152px", height:"112px",borderRadius:"100%"}}/>
          
          }
 
 
   <div style={{background:"none !important"}} className='time-upsss animate__animated animate__zoomInDown  animate__slow 3s'
           >
             {
               againEntered ? <>
               </>
                  :<>
             {user_ans == undefined
               ? <p className=" animate__animated animate__zoomInDown animate__slow 1s" style={{color:"white",fontSize:"40px",background:"none",position:"relative", left:"15px",textAlign:"center",marginTop:"20px"}}>Time's Up!</p> :
               user_ans == "Question Skipped"
                 ? <p className=" animate__animated animate__zoomInDown animate__slow 1s" style={{color:"white",fontSize:"40px",background:"none",position:"relative", left:"15px",textAlign:"center"}}>Question Skipped</p>
               : user_ans
                 ? <p style={{color:"white",fontSize:"40px", background:"none",position:"relative", left:"70px",textAlign:"center",marginTop:"20px"}}>Correct Answer</p>
                 : <p style={{color:"white",fontSize:"40px",background:"none",position:"relative", left:"55px",marginTop:"20px"}}>Incorrect Answer</p>}</>
             }
             
           </div>
 
          
         </div>
      }
      
       
     
    </div>
    
  )
}

export default Answer
