import React, {Component, useEffect, useState} from 'react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { useCommonData } from './Context';
 
const  ReactExcel =()=>{
    let [result,setResult]=useState([])
    const { quizResult } = useCommonData()

    //  useEffect(()=>{
    //     let resultdata=props.result.map((item,index)=>{
    //         return {
    //          rank:index+1,
    //          name:item.nickname,
    //          points:(Number(item.results.map((x)=>x.points).reduce((prev, curr) => prev + curr))),
    //          totalCorrect:(item.results.filter((x)=>x.points>0)).length,
    //          totalIncorrect:(item.results.filter((x)=>x.points<=0)).length,
    //         }
    //    })

    //    setResult(resultdata)
    //  },[])
        return (
            <div style={{marginTop:"50px"}}>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button text-light bg-warning border-0 p-4 justify-content-center mx-auto fs-5 text-center d-flex"
                    style={{color:"white",background:"green",padding:"10px 15px",border:"none",outline:"none",textAlign:"center"}}
                    table="table-to-xls"
                    filename="tablexls"
                    sheet="tablexls"
                    buttonText="Download Quiz Result as XLS "/>
                <table id="table-to-xls" style={{display:"none"}}>
                    <thead>
                    <tr style={{textAlign:"center",margin:"auto"}}>
                            <th colSpan={6} style={{textAlign:"center",margin:"auto",color:"green",padding:"30px auto",fontSize:"35px",fontWeight:"600"}}>Quizophy Quiz Result</th>
                        </tr>
                    <tr>
                        <th style={{color:"red",fontSize:"18px",fontWeight:"600"}}>S.No.</th>
                        <th style={{color:"red",fontSize:"18px",fontWeight:"600"}}>Rank</th>
                        <th style={{color:"red",fontSize:"18px",fontWeight:"600"}}>Name</th>
                        <th style={{color:"red",fontSize:"18px",fontWeight:"600"}}>Total Correct Answer</th>
                        <th style={{color:"red",fontSize:"18px",fontWeight:"600"}}>Total Incorrect Answer</th>
                        <th style={{color:"red",fontSize:"18px",fontWeight:"600"}}>Total Points</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        quizResult.map((item,index)=>{
                            return  <tr key={index}>
                            <td style={{color:"green",fontSize:"17px",fontWeight:"600"}}>{index+1}</td>
                            <td>{item.rank}</td>
                            <td>{item.name}</td>
                            <td>{item.totalCorrect}</td>
                            <td>{item.totalIncorrect}</td>
                            <td>{item.points}</td>
                        </tr>
                        })
                    } 
                    </tbody>
                   
                  
                </table>
 
            </div>
        );
    
}
 
export default ReactExcel