import axios from 'axios'
import React,{useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DataTable from "react-data-table-component";
import "../src/css/ViewQuizResult.css"
import ReactExcel from './ReactExcel';
import { useCommonData } from './Context';
import { APIURL } from './Apiurl';
const columns = [
    {
      id: 1,
      name: "Rank",
      selector: (row) => row.rank,
      sortable: true,
      reorder: true
    },
    {
      id: 2,
      name: "Player Name",
      selector: (row) => row.name,
      sortable: true,
      reorder: true
    },
    {
      id: 3,
      name: "Total Correct",
      selector: (row) => row.totalCorrect,
      sortable: true,
      reorder: true
    },
    {
      id: 4,
      name: "Total Incorrect",
      selector: (row) => row.totalIncorrect,
      sortable: true,
      // right: true,
      reorder: true
    },
    {
      id: 5,
      name: "Total Points",
      selector: (row) => row.points,
      sortable: true,
      // right: true,
      reorder: true
    }
  ];
const ViewQuizResult = () => {
    const [result,setResult]=useState([])
    const [originalData,setOriginalData]=useState([])
    const { setQuizResult } = useCommonData()
    const params=useParams()
    const navigate=useNavigate()

    const getQuizResultUsingId=async ()=>{
        const {data}=await axios.get(`${APIURL}/getQuizResult/${params.quiz_id}/${params.pin_id}`)
        if(data.success===false){
            navigate("/")
        }else{
          setOriginalData(data.data)
            let resultdata=data.data.map((item,index)=>{
                return {
                 rank:index+1,
                 name:item?.nickname,
                 points:item?.points>0?item?.points:0,
                 totalCorrect:item?.correct_length,
                 totalIncorrect:item?.wrong_length,

                }
           })
           setQuizResult(resultdata)
            setResult(resultdata)
        }
    }
    useEffect(()=>{
      if(!params.quiz_id || !params.pin_id){
          navigate("/")
      }else{
        getQuizResultUsingId()
      }
    },[])
  return (
    <>
      {
        result.length<=0 && <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
            <h2 style={{color:"red",fontWeight:"700",margin:"40px auto"}}>No Result Found</h2>
            <button style={{color:"white",background:"red",border:"none",outline:"none",padding:"10px 17px",fontSize:"18px",fontWeight:"700",borderRadius:"10px",cursor:"pointer"}} onClick={()=>{
                navigate("/")
            }}>Back To Home</button>
        </div>
      }


    <div className="container" style={{marginTop:"100px"}}>
        <h2 style={{color:"green",fontWeight:"700",margin:"40px auto",textAlign:"center"}}>Quizophy Quiz Result</h2>
              <DataTable
                  title=""
                  columns={columns}
                  data={result}
                  defaultSortFieldId={0}
                  pagination
                  selectableRows
                 
                />
                <ReactExcel/>
    </div>
      
    </>
  )
}

export default ViewQuizResult