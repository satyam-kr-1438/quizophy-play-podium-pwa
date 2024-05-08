import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation, unstable_HistoryRouter } from 'react-router-dom'
import "../src/css/GameStart.css"
import { APIURL, playUrl } from './Apiurl'
import { useCommonData } from './Context'
import "../src/css/GameTone.css"
import Cookies from 'js-cookie';

// import openSocket from 'socket.io-client'
import clock from './img/clock.png'
import Swal from 'sweetalert2'
import axios from 'axios'
import  {AiOutlineSound}  from 'react-icons/ai';
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { ConnectionLost } from './ConnectionLost'
import { Loader } from './Loader'

let timer1=undefined
let timer2=undefined
let timer3=undefined
const GameStart = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [submitAnswerData,setSubmitAnswer]=useState(false)
  const { user, pin, quiz, index,setToneQuiz,toneQuiz,setIndex,setUser,setPin,setQuiz } = useCommonData()
  const [toggleClassName,setToggleClassName]=useState(toneQuiz)
  const [user_ans, setUserAns] = useState([])
  let time = parseInt(quiz?.questions[index]?.time_limit.split(' ')[0])
  const [quesTimer, setQuesTimer] = useState(location?.state?.timer?(Number(location?.state?.timer)):time)
  const [quesTimer2, setQuesTimer2] = useState(location?.state?.timer?((Number(quiz?.questions[index]?.time_limit.split(' ')[0])-Number(location?.state?.timer))*1000):0)
  const [clickDisabled,setClickDisabled]=useState(false)
      const [timeUp, setTimeup] = useState(false)
  let multipleAns;
  const [pleaseWait,setPleaseWait]=useState(false)
  const [change,setChange]=useState(false)
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [isInBackground, setIsInBackground] = useState(false);
  useEffect(() => {
    if (!pin?.id && !quiz?.id && !user?.id) {
      navigate(`/`)
    }
 }, [])

 useEffect(()=>{
  return ()=>{
    clearTimeout(timer1)
    clearInterval(timer2)
  }
 },[])

  const fetchApi=async ()=>{
    axios.post(`${APIURL}/checkStatusQuizQuestionAnswer`,{pin_id:pin?.id,pin:pin?.pin,quiz_id:quiz?.id,user_id:user?.id,question_id:quiz?.questions[index]?.id,type:"Game Start"}).then(({data})=>{  
      if(data?.navigate && data?.message=="Admin quit the quiz" && !data?.success && data?.pin_id==pin?.id && window?.location?.pathname=="/game-start"){
        adminQuizTheQuiz()
       }
      if(data?.navigate && pin?.id==data?.pin_id && data?.user_id==user?.id && data?.quiz_id==quiz?.id && window?.location?.pathname=="/game-start"){
         if(data?.result_declared==1){
           getResult()
         }
         else if(data?.question_skipped==1){
          navigate('/answer',{state:{user_ans:"Question Skipped"}})
        }
        else if(data?.times_up==1){
          storeTimeoutResult(time)
          navigate('/answer')
        }
        else if(data?.question_answer_status){
          if(data?.result?.correct){
            navigate('/answer', {
              state: { user_ans: true },replace:true
            })
          }else{
            navigate('/answer', {
              state: { user_ans: false },replace:true
            })
          }
        }
      }
  }).catch((error) => {
    if (axios.isAxiosError(error)) {
      // Axios-specific error
      if (error.code === 'ECONNABORTED') {
          if(pin?.id && quiz?.id){
            fetchApi()
          }
      } else {
        if(pin?.id && quiz?.id && user?.id){        
          fetchApi()
        }
      }
    } else {
      if(pin?.id && quiz?.id && user?.id){        
        fetchApi()
      }
    }
  })
  }

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

    // Add event listeners for online and offline events
    window?.addEventListener('online', handleOnlineStatus);
    window?.addEventListener('offline', handleOfflineStatus);

    // Clean up event listeners on component unmount
    return () => {
      window?.removeEventListener('online', handleOnlineStatus);
      window?.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  useEffect(()=>{
    let eventSource=undefined
    if(pin?.id && quiz?.id && user?.id){        
        fetchApi()
    }
  },[])

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


  const setPlayerQuizRejoin=async ()=>{
    const {data}=await axios.post(`${APIURL}/player-details-to-rejoin-quiz`,{quizData:JSON.stringify(quiz),pinData:JSON.stringify(pin),userData:JSON.stringify(user),questionIndex:index,user_id:user?.id,quizPinId:pin?.id})
  }

  useEffect(()=>{
    setPlayerQuizRejoin()
  },[])
 

  const storeTimeoutResult=async (timeOut)=>{
    const data=await axios.post(`${APIURL}/submit/answer/timeout`,{ user_id: user?.id,
      quiz_id: quiz?.id,
      pin_id: pin?.id,
      question_id: quiz.questions[index].id,
      user_ans: -1,
      time_taken: time,
      miliseconds:timeOut*1000,
      correct: false,
      points: 0})
    }


  useEffect(() => {
    if (quesTimer <= 0) {
      setTimeup(true)
      storeTimeoutResult(time)
      navigate('/answer',{replace: true})
    }
    let timer =
      quesTimer > 0 &&
      !timeUp &&
      setInterval(() => {
        localStorage.setItem("podiumQuestionTimerInSeconds",JSON.stringify(quesTimer))
        setQuesTimer(quesTimer - 1)
      }, 1000)
    return () => clearInterval(timer)
  }, [quesTimer])


  useEffect(() => {
    let timer2 =
      setInterval(() => {
        setQuesTimer2((pre)=>pre+319)
      },319)
    return () => clearInterval(timer2)
  },[quesTimer2])


  const submitAnswer = async (user_ans_i,j) => {
    setClickDisabled(true)
    // setSubmitAnswer(true)
    setUserAns(user_ans)
    let allIndex = []
    let correct;
    quiz.questions[index].options.map((x, y) => {
      if(x.right_option == true && x?.id==user_ans_i){
        correct=true
      }else if(x.right_option == false && x?.id==user_ans_i){
         correct=false
      }
    })
    // timer1=setTimeout(()=>{
    //   navigate('/answer', {
    //     state: { user_ans: correct },replace:true
    //   })
    // },1500)
    const {data}=await axios.post(`${APIURL}/submit/answer`,{
      user_id: user.id,
        quiz_id: quiz.id,
        pin_id: pin.id,
        question_id: quiz.questions[index].id,
        user_ans: String(j),
        time_taken: time - quesTimer,
        miliseconds:quesTimer2,
        correct: correct,
        points: correct ? parseInt(quiz?.questions[index]?.points) : 0
    })
    if(data){
        navigate('/answer', {
          state: { user_ans: correct },replace:true
        })
        // navigate("/")
    }
    // navigate('/answer', {
    //   state: { user_ans: correct },replace:true
    // })
    // navigate("/")
  }
  const extractAudioVideo=(text)=>{
    let AVarr=text?.split(".")
    if(AVarr[AVarr?.length-1]==="mpeg" || AVarr[AVarr?.length-1]==="mp3" ){
        return "audio"
    }else  if(AVarr[AVarr?.length-1]==="mp4" || AVarr[AVarr?.length-1]==="x-matroska" ||  AVarr[AVarr?.length-1]==="mkv"){
        return "video"
    }else{
       return "image"
    }
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
          const data=await axios.delete(`${APIURL}/quit-quiz/${pin?.id}/${user?.nickname}`)
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

  return (
    <>
      {
         pleaseWait || !isOnline || isInBackground ?  <div  className='text-start' style={{position:"absolute",display:"flex",justifyContent:"center",alignItems:"center",height:"90vh",width:"100%"}}>
          <ConnectionLost/>
      </div>  :submitAnswerData?<><Loader/></>:<>
      <div className='' style={{background:"#fff",width:"100%",minHeight:"100vh", marginTop:"0px",paddingTop:"10px"}}>
      <div className="container-fluid mb-5">
        {/* Quit Button  */}
      <div style={{position:"fixed",top:"10px",right:"10px",zIndex:"9999999"}}>
        <div className="container_tone">
          <div className={toggleClassName?"unmuted toggle-sound":"unmuted toggle-sound sound-mute"}  href="#" onClick={(e)=>{
                e.preventDefault()
                setToggleClassName(!toggleClassName)
                setToneQuiz(!toggleClassName)
          }}>
              <div className="tooltip--left sound" data-tooltip="Turn On/Off Sound">
                <div className="sound--icon fa fa-volume-off"><AiOutlineSound style={{fontSize:"18px"}}/></div>
                <div className="sound--wave sound--wave_one"></div>
                <div className="sound--wave sound--wave_two"></div>
                <div className="sound--wave sound--wave_three"></div>
              </div>
            </div>

          </div>
         <button className="game_start_quit_quiz_btn" onClick={(e)=>{
            e.preventDefault()
            removeUserFromGame()
         }}>Quit Quiz</button>
      </div>
      </div>
      <div className="container-fluid mt-5">
            <div className="row" style={{margin: "30px 0px 0px 0px",paddingTop:"30px",paddingBottom:"30px"}}>

          <div className='col-12 timer_container' style={{display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ overflow: "hidden" }}>
              {/* <img src={clock} alt="watch" style={{ width: "100%", height: "100%", transform: "scale(1.5)", background: "white" }} /> */}
              <div className="game_start_circular_progress" style={{fontSize:"50px",textAlign:"center",margin:"auto"}}>
                             <CircularProgressbar value={(quesTimer/parseInt(quiz?.questions[index]?.time_limit?.split(' ')[0]))*100} text={`${quesTimer}`} />     
              </div>
            </div>
            {/* <h2 style={{ fontSize: "50px" }}>{quesTimer}</h2> */}
          </div>
          <p style={{ margin:"10px auto",textAlign:"center",fontSize:"30px",color:"green",fontWeight:"500"}}> {String(index+1)+"/"+String(quiz?.questions?.length)}</p>
          {quiz?.question_visibility_to_player==1 &&  <div className="col-12">
                <div className="mx-auto my-4 text-center">
                             {quiz?.questions && quiz?.questions[index]?.image &&  extractAudioVideo(quiz?.questions[index]?.image)==="image" &&
                                <div className='bg-light mx-auto text-center ' style={{width:"100%"}}>
                                  <img src={quiz?.questions[index]?.image} className="question-image" style={{width:"100%",maxHeight:"300px",objectFit:"contain"}} />
                                </div> 
                             }
                               {
                                  quiz?.questions &&   quiz?.questions[index]?.image &&  extractAudioVideo(quiz?.questions[index]?.image)==="audio" &&
                                          <div className='bg-light mx-auto text-center '>                                   
                                            <audio   controls style={{marginLeft:"auto"}}>
                                              <source src={quiz?.questions[index]?.image} />
                                            </audio>
                                        </div>
                               }
                                {
                               quiz?.questions && quiz?.questions[index]?.image &&  extractAudioVideo(quiz?.questions[index]?.image)==="video" &&
                                    <div className='bg-light p-3 mx-auto text-center' style={{height:"320px"}}>                                   
                                    <video  controls style={{marginLeft:"auto",width:"300px",maxHeight:"300px"}}>
                                       <source src={quiz?.questions[index]?.image} />
                                   </video>
                                </div>
                                }
                </div>
                <div className="col-12 my-4 text-center mx-auto">
                     <h3 className="preview" dangerouslySetInnerHTML={{__html:quiz?.questions ? quiz?.questions[index]?.question:""}}/>
                </div>
            </div>}

          <div className="col-12" style={{padding: "0px", margin: "0px", textAlign: "center", margin: "auto" }}>
            <div className="row" style={{ display: "flex", margin: "10px auto", justifyContent: "center", alignItems: "center", flexWrap: "wrap",wordBreak:"break-word" }}>
              {quiz?.questions[index]?.options?.map((item, i) => (
                  <div key={i} className="col-lg-6 col-md-6 col-sm-12 col-12 question_display_style gy-3" style={{marginRight:"auto",marginLeft:"0px"}}>
                       <div className={`option_container_main gy-3 ${i == 0
                    ? 'red'
                    : i == 1
                      ? 'green'
                      : i == 2
                        ? 'blue'
                        : i == 3
                          ? 'blue-fad'
                          : i==4 
                          ?'blueVilot'
                          : i==5
                          ? 'tomato'
                          : i==6
                          ? 'teal'
                          :i==7
                          ?'indigo' 
                          :''}`} onClick={() => {
                            if(!clickDisabled) {
                              setUserAns([i])
                              submitAnswer(item?.id,i)
                            }
                          }} style={{ borderRadius: "10px",width:"450px", textAlign: "center", color: "white", padding: "20px 20px", border: user_ans[0]==i ? '4px solid #f9ed4e' : '' }}>
                        <p className="m-0" style={{fontSize: "20px", fontWeight: "500" }} >{item?.options}</p>
                        </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
      
      </>
      }
    </>
   
  )
}

export { GameStart }
