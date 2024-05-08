import React from 'react'
import "../src/css/ConnectionLost.css"
import connectionLostImage from "../src/img/connection-lost.jpg"
import quizophyLogo from "../src/img/Quizophy-logo.png"

import "react-circular-progressbar/dist/styles.css";
import { useEffect } from 'react';
const Loader = () => {
  return (
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
  )
}

export {Loader}