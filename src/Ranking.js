import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import "./css/Ranking.css"
import { APIURL, playUrl } from './Apiurl'
import { useCommonData } from './Context'
import homePage from "../src/img/back.png"
import quizofy from "../src/img/blue-bg.png"
import rank from "../src/img/winnerss.png"
import winnerIMAGE from "../src/img/winner.gif"
import axios from 'axios'
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HoverRating from './RateExperience'

let emojiArr=["&#128531;","&#128530;","&#128529;","&#128524;","&#128523;","&#128515;","&#128515;","&#128513;","&#128512;","&#128525;"]
const Ranking = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [open,setOpen]=useState(true)
  const { user, pin, setIndex,quiz } = useCommonData()
  const [result, setResult] = useState(location?.state?.result)
  const [quizRank, setQuizRank] = useState(result?.findIndex(x => x?.id == user?.id) + 1)
  const [rankSup, setRankSup] = useState()
  const [feedbackForm,setFeedbackForm]=useState({
    rate:0,
    message:""
  })
  
  const setValuedata=(value)=>{
     setFeedbackForm({
      ...feedbackForm,rate:value
     })
  }
  let top1=quizRank===1 ? "185px":"75px"
  
  useEffect(() => {
    if (!pin?.id && !quiz?.id && !user?.id) {
      navigate(`/`)
    }
  }, [])
  useEffect(() => {
    if (pin?.id) {
      window.history.pushState(null, '', location.pathname + location.search)
      window.addEventListener('popstate', onBackButtonEvent)
    }
    return () => {
      window.removeEventListener('popstate', onBackButtonEvent)
    }
  }, [])

  const onBackButtonEvent = (e) => {
    if (e.state) {
      if (window.confirm('Do you want to go back ?')) {
        deletePlayerRejoinCredential()
        window.location.reload()
        // navigate("/")
      } else {
        window.history.pushState(null, '', `/ranking${location.search}`)
      }
    }
  }
  useEffect(() => {
    if (quizRank === 1) {
      setRankSup("st")
    } else if (quizRank === 2) {
      setRankSup("nd")
    } else if (quizRank === 3) {
      setRankSup("rd")
    } else {
      setRankSup("th")
    }
  }, [quizRank])

 const deletePlayerRejoinCredential=async ()=>{
  if(user?.nickname && pin?.pin)
       await axios.delete(`${APIURL}/delete-rejoin-credential/${user.nickname}/${pin.pin}`)
       Cookies.remove('quizophyPodiumQuizRejoinCredentials')
       localStorage.removeItem("quizophyPodiumQuizRejoinCredentials")
       sessionStorage.removeItem("quizophyPodiumQuizRejoinCredentialsSession")
 }
  useEffect(()=>{
    Cookies.remove('quizophyPodiumQuizRejoinCredentials')
    localStorage.removeItem("quizophyPodiumQuizRejoinCredentials")
    sessionStorage.removeItem("quizophyPodiumQuizRejoinCredentialsSession")
      deletePlayerRejoinCredential()
  },[])

  return (
    <>
          <ToastContainer/>

      {
        open ? <div className="container-fluid main_container" style={{ width: "100vw", height: "100vh", backgroundImage: `url(${quizofy})`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",display: "flex", justifyContent: "center", alignItems: "center" }}>
               
                     <div className="row"  style={{maxWidth:"600px",background:"white",margin:"auto 30px",padding:"20px 10px",borderRadius:"10px"}}>
                         {/* <div className="mx-auto my-3">
                           <p className="text-center">emojiArr[0]</p>
                         </div> */}
                       <div className="col-12">
                            <h6 style={{wordBreak:"break-word"}}>1.) How was your experience (Rate Now) ??</h6>
                            <div style={{display:"flex",justifyContent:"flex-start",alignItems:"center",flexWrap:"wrap"}}>
                              
                              <HoverRating setValuedata={setValuedata}/>
                             </div>
                       </div>

                       <div className="col-12">
                           <h6>2.) Enter Your Feedback</h6>
                           <textarea
                              className="form form-control"
                              placeholder='Enter Your Feedback'
                              value={feedbackForm?.message}
                              onChange={(e)=>{
                                setFeedbackForm({
                                  ...feedbackForm,message:e?.target?.value
                                })
                              }}
                              rows="4"
                            />

                       </div>
                       
                       <div className="mx-auto" style={{marginTop:"20px",textAlign:"center"}}>
                         <button disabled={feedbackForm?.rate<=0 || !open} className="text-center btn-success btn me-2" onClick={async ()=>{
                          if(feedbackForm?.message?.length>0 && feedbackForm?.message?.length<3){
                            Swal.fire({
                              text:"Feedback can't be less than 3 characters",
                              icon:"warning",
                            }) 
                          }
                          else{
                             const {data}=await axios.post(`${APIURL}/submitFeedback`,{pin_id:pin?.id,user_id:user?.id,pin:Number(pin?.pin),...feedbackForm})
                             if(data?.success){
                              setOpen(false)
                              toast.success("Your Feedback Submitted Successfully", {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                theme: "dark",
                                })
                             }else{
                              setOpen(false)
                             }
                          }
                         }}>Submit</button>
                         <button className="text-center btn-danger btn" onClick={()=>{
                          setOpen(false)
                         }}>Skip</button>
                       </div>
                     </div>
                 
          </div>:<>
          <div className='navigate_btn container-fluid'>
              <button className='home_btn_navigate' onClick={() => {
                deletePlayerRejoinCredential()
                window.location.reload()
              }} >
                <img className='' src={homePage} style={{width:"50%", padding:"0px",margin:"0"}}/>
              </button>
      </div>
   
      <div className="container-fluid main_container" style={{ width: "100vw", height: "100vh", backgroundImage: `url(${quizofy})`, backgroundRepeat: "no-repeat", backgroundPosition: "center center", backgroundSize: "cover",display: "flex", justifyContent: "center", alignItems: "center" }}>

                      <div className="image_bg" style={{ width: "200px", height: "250px", position: "absolute" }}>
                      {
                                    quizRank===1 && <img src={winnerIMAGE} style={{width:"180px",height:"199px", marginTop:"-86px",marginLeft:"-2px"}}/>
                      }
                        {
                          quizRank===0 ? <h2 style={{ position: "absolute", left:"-50px",top: "50%",color:"white",width:"300px",textAlign:"center",fontSize:"20px",border:"2px solid white",padding:"20px",borderRadius:"10px"}}>No answers captured</h2> :<>
                                  <img src={rank} alt="rank" style={{ width: "100%", height: "100%"}} />
                                  <p style={{ position: "absolute", top: top1, left: "80px", fontSize: "35px", color: "black", fontWeight: "700" }}>{quizRank}<sup>{rankSup}</sup></p>

                          </> 

                        }
                        {/* <p style={{ position: "absolute", top: top1, left: "80px", fontSize: "35px", color: "black", fontWeight: "700" }}>{quizRank}<sup>{rankSup}</sup></p> */}
                      </div>

       </div>
          </>
      }
   
    </>
    
   


    
    
    
  )
}
export default Ranking
