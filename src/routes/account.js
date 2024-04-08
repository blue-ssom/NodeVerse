// 계정과 관련된 API
const router = require("express").Router()
const pool = require("../../database/pg");
// const jwt = require("jsonwebtoken")

// 아이디 찾기
router.get('/find-id', async(req, res) => {
    const { name, phoneNumber} = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        const sql = `SELECT id FROM scheduler.user WHERE name = $1 AND phonenumber = $2`;
        const data = await pool.query(sql, [name, phoneNumber]);

        const row = data.rows

        if(row.length === 0){
            throw new Error("회원정보가 존재하지 않습니다.")
        }
        
        result.success = true
        result.message = "아이디 찾기 성공";
        result.data = row[0].id;

   } catch (err) {
       result.message = err.message;
   } finally {
       res.send(result);
   }
});

// 비밀번호 찾기
router.get('/find-password', async(req, res) => {
    const { id, name, phoneNumber} = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        const sql = `SELECT password FROM scheduler.user WHERE id = $1 AND name = $2 AND phoneNumber = $3`;
        const data = await pool.query(sql, [id, name, phoneNumber]);

        const row = data.rows

        if(row.length === 0){
            throw new Error("회원정보가 존재하지 않습니다.")
        }
        
        result.success = true
        result.message = "비밀번호 찾기 성공";
        result.data = row[0].password;

   } catch (err) {
       result.message = err.message;
   } finally {
       res.send(result);
   }
});

module.exports = router