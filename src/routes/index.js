// 로그인 API

const router = require("express").Router()
const pg = require('../../database/pg')
const jwt = require("jsonwebtoken")
const redis = require("redis").createClient();
const { loginValidate, validate } = require('../middlewares/validator');

router.post("/login", loginValidate, validate, async(req,res) => {
    const { id, password } = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
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
        const token = jwt.sign({
            idx: user.idx, 
            id: id, 
            name: user.name, 
            role : user.role
        },process.env.TOKEN_SECRET_KEY,{
            "issuer": "stageus",
            "expiresIn": "30m", 
        })

        await redis.connect()
        // 집합(set)에 새로운 멤버를 추가하는 명령어
        await redis.sAdd(`today`, id)

        // sorted set에 새로운 멤버를 추가하는 명령어
        await redis.zAdd('user_login', {
            score : Date.now(), 
            value : id
        });

        // DB 통신 결과 처리
        result.success = true
        result.message = "로그인 성공!";
        result.data = row;
        result.token = token;
        
    } catch (err) {
        console.log(err)
        result.message = err.message
    } finally {
        res.send(result)
    }
})

// 오늘 하루 동안 로그인한 회원 수 조회 API 
router.get('/visitors/count', async (req, res) => {
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        await redis.connect()
        // scard 함수를 프로미스로 변환
        const count = await redis.sCard('today');

        result.success = true;
        result.data = count;
        result.message = "로그인 수 조회 성공";

    } catch (err) {
        console.log(err)
        result.message = err.message
    } finally {
        res.send(result)
    }
});

// export 작업
module.exports = router