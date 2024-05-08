import React, { useContext, useEffect } from 'react'
import { useState } from 'react'
import { APIURL } from './Apiurl'
import { useNavigate, useParams } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCommonData } from './Context'
import quizophy from "./img/homebg.gif"
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Avatar from '@mui/material/Avatar';
import ".././node_modules/bootstrap/dist/css/bootstrap.min.css"
import '../src/css/Join.css'
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import logo_quizophy from "./img/logoQuizophyLoading.png"
import axios from 'axios';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { AiOutlineClose } from 'react-icons/ai';
import Typography from '@mui/material/Typography';
import LoadingLogo from "../src/img/logoQuizophyLoading.png"
import FingerprintJS  from '@fingerprintjs/fingerprintjs';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
function BootstrapDialogTitle(props) {
  const { children, onClose, ...other } = props;
 
  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: "red",
          }}
        >
          <AiOutlineClose />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};
const Join = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [quizPin, setQuizPin] = useState(id ? id : '')
  const [error, showError] = useState()
  const { setUser, setPin ,pin,setImage,user,quiz,setQuiz,setIndex} = useCommonData()
  const [avatar, setAvatar] = useState('');
  const [display,setDisplay]=useState(false);
  const [visibleSuggestion,setVisibleSuggestion]=useState(false)
  const [open, setOpen] = useState(false);
  const [storeName,setStoreName]=useState("")
  const [loading,setLoading]=useState(true)
  const [disableBtn,setDisableBtn]=useState(false)
  useEffect(()=>{
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
        setTimeout(()=>{
          setLoading(false)
        },3000)
      }else{
        setTimeout(()=>{
           setLoading(false)
        },2000)
      }
 },[loading,setLoading])


//  const getUniqueCode=async ()=>{
//   const fp = await FingerprintJS.load()
//   const result = await fp.get()     
//   console.log(result?.visitorId) 
//  }
//  useEffect(()=>{
//     getUniqueCode()
//  })
 
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const callAnotherFun=async(id,PIN,userId,quizDetail)=>{
    const {data}=await axios.get(`${APIURL}/getCurrentQuizQuestionStatus/${id}/${PIN}`)
      let quizData=data.data
      if(quizData?.result_declared==1){
        localStorage.removeItem("podiumQuestionTimerInSeconds")
        getResult()
      }
      else if(quizData?.question_skipped==1){
        localStorage.removeItem("podiumQuestionTimerInSeconds")
        navigate('/answer',{state:{user_ans:"Question Skipped"}})
      }
       if(typeof quizData?.question_answer_status=="undefined" || typeof quizData?.question_answer_status=="object"){
         navigate("/instruction")
       }
       else{
        if(quizData?.quiz_id && quizData?.pin_id){
          axios.post(`${APIURL}/checkUserAlreadyAnsweredOrNotStatus`,{quiz_id:quizData?.quiz_id,pin_id:quizData?.pin_id,user_id:userId,question_id:quizDetail?.questions[quizData.question_number]?.id,pin:PIN}).then(({data})=>{
            let userAnswered=data?.data
            if(data?.data?.question_skipped==1){
              setIndex(userAnswered.question_number)
              localStorage.removeItem("podiumQuestionTimerInSeconds")
              navigate("/answer",{state:{user_ans:"Question Skipped"}})
            }
            else if(data?.answered && data?.success){
              setIndex(userAnswered.question_number)
                localStorage.removeItem("podiumQuestionTimerInSeconds")
                navigate("/answer",{state:{user_ans:true}})
            }else if(!data?.answered && data?.success){
              if(data?.timeUp){
                setIndex(userAnswered.question_number)
                localStorage.removeItem("podiumQuestionTimerInSeconds")
                navigate("/answer")
              }
              if(!data?.timeUp){ 
                setIndex(userAnswered.question_number) 
                localStorage.removeItem("podiumQuestionTimerInSeconds")
                navigate("/answer",{state:{user_ans:false}})
              }
            }
            else if(!data?.answered && !data?.success && !data?.timeUp && data?.data?.times_up==1){
                setIndex(userAnswered.question_number)
                localStorage.removeItem("podiumQuestionTimerInSeconds")
                navigate("/answer")
            }
            else if(!data?.success){
              if(!userAnswered?.question_answer_status){
                   setIndex(userAnswered.question_number)
                   navigate("/game-start",{state:{timer:Number(userAnswered.question_timer)>=3?(Number(userAnswered.question_timer)-2):Number(quiz?.questions[quizData?.question_number]?.time_limit?.split(' ')[0])},replace:true})
              }else{
               setIndex(userAnswered.question_number)
               localStorage.removeItem("podiumQuestionTimerInSeconds")
               navigate("/answer",{state:{message:"You Are In The Game Again"}})
              }
            }
            else if(!userAnswered && quizData?.question_skipped==1) {
              navigate('/answer',{state:{user_ans:"Question Skipped"}})
            }
       })
         }
       }  
  }
  const getPlayerRejoinCredentials=async (...rest)=>{
    try{
      let data;
       if(rest?.length>0){
        let name=rest[0].name
        let quizPin=rest[0].pin
        data=await axios.get(`${APIURL}/get-player-credential-to-rejoin/${name.trim()}/${quizPin}`)
       }else{
        data=await axios.get(`${APIURL}/get-player-credential-to-rejoin/${name.trim()}/${quizPin}`)
       }
      data=data.data
      if(data.success){
        if(JSON.parse(data.data.userData)){
          setUser(JSON.parse(data.data.userData))
        }
        if(JSON.parse(data.data.pinData)){
          setPin(JSON.parse(data.data.pinData))
        }
        if(JSON.parse(data.data.quizData)){
          setQuiz(JSON.parse(data.data.quizData))
        }
        if(data.data.questionIndex){
          setIndex(data.data.questionIndex)
        }
        if(!JSON.parse(data.data.quizData)){
          let pinId=JSON.parse(data.data.pinData).id
          let quizPin=JSON.parse(data.data.pinData).pin
          if(pinId && quizPin){
            axios.get(`${APIURL}/getQuizInfoAfterReconnection/${pinId}/${quizPin}`).then(({data})=>{
              const request = {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json'
                },
                redirect: 'follow'
              }
              fetch(`${APIURL}/get-quiz-details/${data.key}`, request)
                .then(data => data.json())
                .then(data => {
                  if (data.data) {
                    setQuiz(data.data)
                    // localStorage.setItem("quizophyPodiumQuizRejoinCredentials",JSON.stringify({pin_id:pin?.id,user_id:user?.id,pin:pin?.pin,quiz_id:data?.data?.id,quiz_key:data?.data?.key,name:user?.nickname}))
                  }
                })
                .catch(err => {
                  console.log(err, 'err')
                })
            })
          }
        }
        let userId=JSON.parse(data.data.userData).id
        let pinId=JSON.parse(data.data.pinData).id
        let quizPin=JSON.parse(data.data.pinData).pin
        if(pinId && quizPin){
          callAnotherFun(pinId,quizPin,userId,JSON.parse(data.data.quizData))
        }
        // navigate("/instruction")

      }
    }catch(error){
    }      
  }

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


  const submit = async (e) => {
    e.preventDefault()
    setDisableBtn(true)
    if (!name || name == '' || name.trim().length==0) { 
      setDisableBtn(false)     
        return  Swal.fire({
          text:"please enter a nickname",
          icon:"warning",
        })
    }
    if (!quizPin || quizPin == '' || quizPin.trim().length==0) {
      setDisableBtn(false)
      return  Swal.fire({
        text:"Please enter a Quiz pin",
        icon:"warning",
      })
    }
    const request = {
      method: 'POST',
      body: JSON.stringify({
        nickname: name.trim(),
        pin: quizPin?.trim(),
        avatar:avatar
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow'
    }


    const present=await axios.post(`${APIURL}/in-or-not`,{nickname:name.trim(),pin:quizPin.trim()})
    if(present.data.message==="continue"){
      const data=await axios.get(`${APIURL}/check-player-limit-exceed/${quizPin.trim()}`)
      if(data.data.success){
        fetch(`${APIURL}/user`, request)
        .then(data => data.json())
        .then(data => {
          if(data.message){
            if(data.message==="nickname already exists."){
              setStoreName(name)
              setVisibleSuggestion(true)
            }
            setDisableBtn(false)
            return  Swal.fire({
              text:data.message,
              icon:"warning",
            })
          }
          if (data.data) {
            setDisableBtn(true)
            sessionStorage.setItem("quizophyPodiumQuizRejoinCredentialsSession",JSON.stringify({pin_id:data?.data?.pin?.id,user_id:data?.data?.id,pin:data?.data?.pin?.pin,name:data?.data?.nickname}))
            localStorage.setItem("quizophyPodiumQuizRejoinCredentials",JSON.stringify({pin_id:data?.data?.pin?.id,user_id:data?.data?.id,pin:data?.data?.pin?.pin,name:data?.data?.nickname}))
            Cookies.set('quizophyPodiumQuizRejoinCredentials', JSON.stringify({pin_id:data?.data?.pin?.id,user_id:data?.data?.id,pin:data?.data?.pin?.pin,name:data?.data?.nickname}), { expires: 7 }); // Expires in 7 days
            setPin(data.data.pin)
            delete data.data.pin
            setUser(data.data)
            setImage(avatar)
            localStorage.removeItem("podiumQuestionTimerInSeconds")
            navigate(`/instruction`)
          }        
        })
        .catch(err => {
          setDisableBtn(false)
        })
      }
      else{
        if(data.data.message==="Pin not found"){
          setDisableBtn(false)
          Cookies.remove('quizophyPodiumQuizRejoinCredentials')
          sessionStorage.removeItem("quizophyPodiumQuizRejoinCredentialsSession")
          localStorage.removeItem("quizophyPodiumQuizRejoinCredentials")
          return  Swal.fire({
            text:"Pin not found",
            icon:"warning",
          })
        }
        setDisableBtn(false)
        return  Swal.fire({
          text:"You can't join (Player limit exceed)",
          icon:"warning",
        })
      }
      
    }
    else{
      getPlayerRejoinCredentials()
    }
  }

  const cantJoin=()=>{
   return Swal.fire({
      text:"Nickname should not be more than 20 characters",
      icon:"warning",
    })
  }


 
  const handleChange = (event) => {
    setAvatar(event.target.currentSrc);
    setDisplay(true);
  };
  let q_formHeight=visibleSuggestion ? "350px" :"281px"

  return (
    <>
    {
      loading ? <>
         <div style={{width:"100%",height:"100vh",display:"flex",justifyContent:"center",alignItems:"center"}}>
           <div style={{margin:"auto"}}>
             <div className="text-center mx-auto">
               <div className="spinner-border text-dark fs-3" role="status">
                   {/* <span class="sr-only">Loading...</span> */}
               </div>
               <h3>Please Wait...</h3>
             </div>
           </div>
         </div>
      </>:
        <div className="quizophy" >
      <div className="container-fluid quizophy_bg">
        <div className="row container_row" style={{ backgroundImage: `url(${quizophy})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <div className="col-12 q_heading">
            <p style={{width:"230px",margin:"20px auto"}}> <img style={{width:"100%"}} src={logo_quizophy}/></p>
          </div>
        

        <div className="col-12 q_form" style={{backgroundColor: "rgba(0,0,0,0.7)",maxHeight:q_formHeight}}>
            <form autoComplete='off'>
              <input style={{padding:"15px 0px 15px 20px"}} className="form-control" type="text" value={quizPin} name="quizpin" onChange={e => setQuizPin(e.target.value)} placeholder="Enter Join code" aria-label="default input example" />
              <p>Hello My Name Is Satyam Kumar</p>
              <input style={{padding:"15px 0px 15px 20px"}} className="form-control" type="text" value={name} name="nickname" maxLength={20} onChange={e => {
                  setName(e.target.value) 
              }} placeholder="Nickname" aria-label="default input example" />
              {
               visibleSuggestion && <div style={{display:"flex",justifyContent:"center", alignItems:"space-evenly", height:"60px",marginBottom:"20px",width:"100%"}}>
                 <p style={{color:"white",background:"red",padding:"5px 10px", height:"45px",borderRadius:"5px",margin:"-4px auto auto auto",cursor:"pointer",display:"flex",alignItems:"center"}} onClick={()=>{
                  handleClickOpen()
                 }}>Choose Your Nickname</p>
                </div>
              }
                <Box sx={{ minWidth: 120 }} style={{marginTop:"-50px"}} >
              <Avatar  alt="Remy Sharp" className="avatar_top" src={avatar} style={{ position:"relative",top:"50px",left:"20px", border:"none",outline:"none" }} />

      <FormControl fullWidth >{
        display===false ?
          <InputLabel id="demo-simple-select-label" className="text-white" >Select Avatar</InputLabel>
          : <InputLabel id="demo-simple-select-label" className="text-white">Avatar</InputLabel>

      }
      
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value=""
          label="Avatar"
          placeholder='Avatar'
          // onChange={(e)=>handleChange(e)}
        >
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)} src="https://cdn-icons-png.flaticon.com/512/2202/2202112.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/1144/1144709.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
           <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4140/4140047.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4333/4333609.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/706/706830.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/219/219969.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/194/194829.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/3940/3940403.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/145/145843.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4140/4140051.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4322/4322991.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4140/4140037.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4140/4140051.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/706/706807.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item"  value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4323/4323004.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/1999/1999625.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item" value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/1154/1154473.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>
          <MenuItem className="menu_item"  value="" style={{width: "60px",height:"60px",margin:"5px",padding:"0px",borderRadius:"100%"}}>
            <img  onClick={(e)=>handleChange(e)}  src="https://cdn-icons-png.flaticon.com/512/4139/4139993.png" style={{width:"100%",height:"100%",borderRadius:"50%"}} alt="hello"/>
          </MenuItem>

          
         
                      
        </Select>
      </FormControl>
    </Box>

                 </form>

          </div>



          <div className="col-12 text-center">
            {
              disableBtn ? <></>:<button disabled={disableBtn} className="btn btn-secondary px-5 py-3" style={{fontSize:"22px",fontWeight:"700",  boxShadow: "0 14px 28px rgba(0,0,0,0.25)\, 0 10px 10px rgba(0,0,0,0.22)",marginTop:"-10px",background:"rgba(0, 0, 0, 0.7)",color:"white"
          }} onClick={(event) => submit(event)}>Join Now</button>
            }
          
          </div>
        </div>
      </div>

      <div style={{position:"absolute"}}>
      <BootstrapDialog
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Select Your Nickname
        </BootstrapDialogTitle>
        <DialogContent dividers>
         <div gutterBottom style={{display:"flex",flexDirection:"column",justifyContent:"space-evenly",alignItems:"center",justifyItems:"center",flexWrap:"wrap"}}>
             <div style={{display:"flex",flexDirection:"row",justifyContent:"space-evenly",alignItems:"center",justifyItems:"center",flexWrap:"wrap"}}>
               <input style={{color:"white", cursor:"pointer",background:"red",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}1`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
               <input style={{color:"white", cursor:"pointer",background:"green",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}2`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
               <input style={{color:"white", cursor:"pointer",background:"blue",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}3`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
               <input style={{color:"white", cursor:"pointer",background:"orange",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}4`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
                <input style={{color:"white", cursor:"pointer",background:"indigo",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}5`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
             </div>
               
             <div style={{display:"flex",flexDirection:"row",justifyContent:"space-evenly",alignItems:"center",justifyItems:"center",flexWrap:"wrap"}}>
             <input style={{color:"white", cursor:"pointer",background:"red",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}6`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
             <input style={{color:"white", cursor:"pointer",background:"green",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}7`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
             <input style={{color:"white", cursor:"pointer",background:"blue",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}8`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
             <input style={{color:"white", cursor:"pointer",background:"orange",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}9`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
             <input style={{color:"white", cursor:"pointer",background:"indigo",padding:"2px 5px", height:"45px",borderRadius:"5px",margin:"5px",display:"flex",alignItems:"center",justifyContent:"space-evenly",textAlign:"center",width:"100px"}} value={`${storeName}10`} onClick={(e)=>{
                    e?.preventDefault()
                    setName(e?.target?.value)
                    handleClose()
               }}></input> 
             </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus  style={{color:"white",background:"red"}} onClick={handleClose}>
              cancle
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </div>

      
    
     {/* <CurrencySelect/> */}
    
        </div>
    }
    </>
  )
}

export { Join }
