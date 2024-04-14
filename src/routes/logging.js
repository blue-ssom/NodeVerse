// admin 권한 받아오기

const router = require("express").Router()
const pool = require("../../database/pg");
const jwt = require("jsonwebtoken")
const checkLogin = require('../middlewares/checkLogin');

router.get('/', checkLogin,  async(req, res) => {
    const userRole = req.decoded.role // Token에 저장되어있는 사용자 role
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }
    try{

        if (userRole !== 'admin'){
            throw new error("권한이 없습니다.");
        }

        const logs = await mongodb.db("notification_system").collection("log_history").sort({ timestamp: -1 }).toArray();

        result.success = true;
        result.message = "로그 조회 성공";
        result.data = logs;

    } catch (err) {
        console.log(err)
        result.message = err.message
    } finally {
        res.send(result)
    }
})

module.exports = router