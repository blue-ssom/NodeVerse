// 계정과 관련된 API

const router = require("express").Router()
const pool = require("../../database/pg");
const jwt = require("jsonwebtoken")
const checkLogin = require('../middlewares/checkLogin');
const {  validateUser, validate } = require('../middlewares/validator');
const UploadBucket = require('../middlewares/bucket');
const upload = new UploadBucket();

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

// 특정 user 정보 보기(S3)
router.get('/:idx', checkLogin, async(req, res) => {
    const userIdx = req.decoded.idx // Token에 저장되어있는 사용자 idx
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

// 프로필 이미지만 변경하는 API(S3)
router.put('/profile-image', checkLogin, upload.profileImage('image'), async (req, res) => {
    const userIdx = req.decoded.idx; // Token에 저장되어 있는 사용자 idx
    console.log(userIdx)
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        // 이미지 업로드가 완료되었는지 확인
        if (!req.file || !req.file.location) {
            return res.status(400).json({ success: false, message: "Uploaded image key not found" });
        }

        // 업로드된 파일 처리 로직 추가
        const profileImagePath = req.file.location; // S3에 업로드된 이미지의 경로
        const sql = `
        UPDATE scheduler.user SET profile_image_key = $1 WHERE idx = $2 RETURNING *;`;
        const data = await pool.query(sql, [profileImagePath, userIdx]);
        const row = data.rows

        result.success = true;
        result.message = "프로필 이미지 변경 성공";
        result.data = row[0];

    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

// 회원가입(S3)
router.post('/', upload.profileImage('image'), async(req, res) => {
    // 이미지 업로드가 완료되었는지 확인
    if (!req.file || !req.file.location) {
        return res.status(400).json({ success: false, message: "Uploaded image key not found" });
    }

    const { id, password, name, phoneNumber, email, address } = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        
        // 업로드된 파일 처리 로직 추가
        const profileImagePath = req.file.location; // S3에 업로드된 이미지의 경로
        const sql = `
        INSERT INTO scheduler.user (id, password, name, phonenumber, email, address, profile_image_key) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;`; // RETURNING을 사용하여 삽입된 데이터를 반환
        const data = await pool.query(sql, [id, password, name, phoneNumber, email, address, profileImagePath]);
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