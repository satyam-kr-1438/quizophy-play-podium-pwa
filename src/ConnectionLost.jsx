import React from 'react'
import "../src/css/ConnectionLost.css"
import connectionLostImage from "../src/img/connection-lost.jpg"
import quizophyLogo from "../src/img/Quizophy-logo.png"

import "react-circular-progressbar/dist/styles.css";
import { useEffect } from 'react';
import { useState } from 'react';
const ConnectionLost = () => {
  const [refreshSpinner, setRefreshSpinner] = useState(15);
  const [showRefresh,setShowRefresh]=useState(false)
  const handleReplay = () => {
    setRefreshSpinner(15)
    setShowRefresh(true)
  };
  useEffect(()=>{
    let interSpinner= setInterval(()=>{
      refreshSpinner>0  ? setRefreshSpinner((pre)=>pre-1):setShowRefresh(false)
    },1000)
    return ()=>{
      clearInterval(interSpinner)
    }
  },[setShowRefresh,showRefresh,setRefreshSpinner,refreshSpinner])
  return (
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
                
               </div>
           </div>
        </div>
    </div>
    </div>
   
  )
}

export {ConnectionLost}