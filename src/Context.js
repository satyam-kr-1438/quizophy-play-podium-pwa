import React, { createContext, useContext, useState } from 'react'

const CommonDataContext = createContext({})
const CommonDataProvider = ({ children }) => {
  const [user, setUser] = useState()
  const [pin, setPin] = useState()
  const [quiz, setQuiz] = useState()
  const [index, setIndex] = useState(0)
  const [user_ans, setUserAns] = useState(undefined)
  const [image,setImage]=useState("")
  const [toneQuiz,setToneQuiz]=useState(false)
  const [quizResult,setQuizResult]=useState([])
  
  return (
    <CommonDataContext.Provider
      value={{
        user,
        setUser,
        pin,
        setPin,
        quiz,
        setQuiz,
        index,
        setIndex,
        image,
        setImage,
        toneQuiz,
        setToneQuiz,
        quizResult,
        setQuizResult
      }}
    >
      {children}
    </CommonDataContext.Provider>
  )
}

const useCommonData = () => useContext(CommonDataContext)

export { CommonDataProvider, useCommonData }
