// 계정과 관련된 API

const router = require("express").Router()
const pool = require("../../database/pg");
// const jwt = require("jsonwebtoken")
const {  validateUser, validate } = require('../middlewares/validator');

// 아이디 찾기
router.get('/find-id', validateUser, validate, async(req, res) => {
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
router.get('/find-password', validateUser, validate, async(req, res) => {
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

// 특정 user 정보 보기
router.get('/:idx', async(req, res) => {
    const userIdx = req.params.idx
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        const sql = `SELECT * FROM scheduler.user WHERE idx = $1`;
        const data = await pool.query(sql, [userIdx]);
        const row = data.rows

        if (row.length === 0) {
            throw new Error("회원정보가 존재하지 않습니다.");
        }
        
        result.success = true;
        result.message = "특정 user 정보 조회 성공";
        result.data = row[0];

    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 내 회원 정보 수정
router.put('/', validateUser, validate, async(req, res) => {
    const { password, name, phoneNumber, email, address } = req.body
    const result = {
            "success" : false,
            "message" : "",
            "data" : null
        }
   
    try {

        const sql = `
            UPDATE scheduler.user 
            SET password = $1, name = $2, phonenumber = $3, email = $4, address = $5 
            WHERE idx = $6
            RETURNING *; -- 수정된 정보를 반환
        `;
        const data = await pool.query(sql, [password, name, phoneNumber, email, address, 1]);
        const row = data.rows

        result.success = true;
        result.message = "내 정보 수정 성공";
        result.data = row[0];
        
    } catch(err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 회원가입
router.post('/', validateUser, validate, async(req, res) => {
    const { id, password, name, phoneNumber, email, address } = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        const sql = `
            INSERT INTO scheduler.user (id, password, name, phonenumber, email, address) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const data = await pool.query(sql, [id, password, name, phoneNumber, email, address]);
        const row = data.rows

        result.success = true;
        result.message = "회원가입 성공";
        result.data = row[0];

    } catch(err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 회원탈퇴
router.delete('/',  async(req, res) => {
    const result = {
            "success" : false,
            "message" : "",
            "data" : null
        }
   
    try {

        const sql = `
            DELETE FROM scheduler.user 
            WHERE idx = $1
        `;
        const data = await pool.query(sql, [4]);
        const row = data.rows

        result.success = true;
        result.message = "회원탈퇴 성공";
        
    } catch(err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

module.exports = router