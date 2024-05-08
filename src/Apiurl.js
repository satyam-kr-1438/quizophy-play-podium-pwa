export const APIURL =
  window.location.host === 'localhost:3001'
    ? 'http://localhost:5006/api/conferenceQuiz/quiz'
    : 'https://quiz.quizophy.com/api/conferenceQuiz/quiz'
    // : 'https://quiz.datacubeindia.com/api/conferenceQuiz/quiz'

export const playUrl =
  window.location.host === 'localhost:3001'
    ? 'http://localhost:5006'
    : 'https://quiz.quizophy.com'
    // :`https://quiz.datacubeindia.com`
