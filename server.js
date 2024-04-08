const express = require("express")  // express.js import하기
const dotenv = require('dotenv').config();  // dotenv 패키지를 사용하여 환경 변수 로드
const mongodb = require("./database/mongodb")   // mongoDB연결
const pg = require('./database/pg') // postgreSQL연결

const app = express()
const port = 8000

app.use(express.json())

const LoginApi =  require("./src/routes/index") // index.js파일 import
app.use("/login", LoginApi)

const accountRouter = require('./src/routes/account');  // account.js파일 import
app.use('/account', accountRouter);

// const postRouter = require('./src/routes/post');  // post.js파일 import
// app.use('/post', postRouter);

// const notificationRouter = require('./src/routes/notification');  // notification.js파일 import
// app.use('/notification', notificationRouter);

// Web Server 실행 코드
app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`)
})