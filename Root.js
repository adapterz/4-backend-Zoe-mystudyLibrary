// express 모듈 가져오기
const express = require('express')
const app = express()

// Csp
const helmet = require('helmet')
app.use(helmet())
app.disable('x-powered-by')

// 포트번호 지정
const port = 3000

const todoRouter = require('./TodoRouter')

app.use('/todo', todoRouter)

app.listen(port, () => {
    console.log('Test ${port}')
})