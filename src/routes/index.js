// 로그인 API

const router = require("express").Router()
const pg = require('../../database/pg')
// const jwt = require("jsonwebtoken")
const {  validateUser, validate } = require('../middlewares/validator');

router.post("/", validateUser, validate, async(req,res) => {
    const { id, password } = req.body
    const result = {
        "success": false,
        "message": "",
    }

    try{
        // DB통신 
        const sql = `SELECT * FROM scheduler.user WHERE id = $1 AND password = $2`;
        const data = await pg.query(sql, [id, password]);

        // DB 후처리
        const row = data.rows

        if(row.length === 0){
            throw new Error("회원정보가 존재하지 않습니다.")
        }

        const user = row[0]; // 첫 번째 행의 정보를 사용자로 정의

        // token 발행
        // const token = jwt.sign({
        //     idx: user.idx, 
        //     id: id, 
        //     name: user.name, 
        // },process.env.TOKEN_SECRET_KEY,{
        //     "issuer": "stageus",
        //     "expiresIn": "30m", 
        // })

        // DB 통신 결과 처리
        result.success = true
        result.message = "로그인 성공!";
        result.data = row;
        // result.token = token;
        
    } catch (err) {
        console.log(err)
        result.message = err.message
    } finally {
        res.send(result)
    }
})

// export 작업
module.exports = router