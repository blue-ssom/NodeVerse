// 계정과 관련된 API

const router = require("express").Router()
const pool = require("../../database/pg");
const redis = require("redis").createClient();
const jwt = require("jsonwebtoken")
const checkLogin = require('../middlewares/checkLogin');
const { loginValidate, findIdValidate, findPasswordValidate, updateUserInfoValidate, signUpValidate, validate } = require('../middlewares/validator');
const uploader = require('../middlewares/multer');
const UploadBucket = require('../middlewares/bucket');
const upload = new UploadBucket();

// 로그인 API
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

// 아이디 찾기
router.get('/find-id', findIdValidate, validate, async(req, res) => {
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
router.get('/find-password', findPasswordValidate, validate, async(req, res) => {
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
router.put('/', checkLogin, updateUserInfoValidate, validate, async(req, res) => {
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

// 프로필 이미지 변경 API(S3)
router.put('/profile-image', checkLogin, imageValidate, upload.profileImage('image'), async (req, res) => {
    const userIdx = req.decoded.idx; // Token에 저장되어 있는 사용자 idx
    console.log(userIdx)
    const { file } = req; // 업로드된 파일
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        // 업로드된 파일 처리 로직 추가
        const profileImagePath = req.file.location; // S3에 업로드된 이미지의 경로
        const sql = `UPDATE scheduler.user SET profile_image_key = $1 WHERE idx = $2 RETURNING *;`;
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

// 프로필 이미지 변경 API(EBS)
router.put('/profile-image/ebs', checkLogin, imageValidate, uploader.single('image'), async (req, res) => {
    const userIdx = req.decoded.idx; // Token에 저장되어 있는 사용자 idx
    const { file } = req; // 업로드된 파일

    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        // 이미지 경로
        const imagePath = `public/img/${req.file.originalname}`;

        // 프로필 이미지 경로 업데이트
        const sql = `
        UPDATE scheduler.user
        SET profile_image_key = $1
        WHERE idx = $2
        RETURNING *;`;
        const data = await pool.query(sql, [imagePath, userIdx]);
        const row = data.rows;

        if (row.length === 0) {
            throw new Error("프로필 이미지 변경에 실패했습니다.");
        }
       
        result.success = true;
        result.message = "프로필 이미지 변경 성공";
        result.data = {
            profile_image_key: imagePath // 프로필 이미지 경로 포함
        };
    } catch(err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 회원가입(S3)
router.post('/', signUpValidate, upload.profileImage('image'), async(req, res) => {
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

// 회원가입(EBS)
router.post('/ebs', signUpValidate, uploader.single('image'), async (req, res) => {
    const { id, password, name, phoneNumber, email, address } = req.body;
    const { file } = req;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {

        // EBS에 파일 저장
        const imagePath = `${'public/img/'}${file.originalname}`;

        // 회원가입 로직 실행
        const sql = `
        INSERT INTO scheduler.user (id, password, name, phonenumber, email, address, profile_image_key) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;`; // RETURNING을 사용하여 삽입된 데이터를 반환
        const data = await pool.query(sql, [id, password, name, phoneNumber, email, address, imagePath]);
        const row = data.rows;

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
router.delete('/', checkLogin, async(req, res) => {
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

// 오늘 로그인한 사람들 수 조회
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

// 최근 접속자 목록 조회
router.get('/visitors/list', async (req, res) => {
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }
    try {
        await redis.connect()
        
        const members = redis.zRange('user_login', 0, 4, 'WITHSCORES')
        members.reverse()

        // 최근 로그인 사용자를 저장할 리스트 초기화
        const recentLoginUsers = [];

        // members 배열에서 홀수 인덱스에는 사용자 이름이 저장되어 있음
        for (let i = 0; i < members.length; i ++) {
            const user = members[i];
            recentLoginUsers.push(user);
        }

        // 중복 제거
        const uniqueUsers = Array.from(new Set(recentLoginUsers));

        // 순서를 유지하면서 최대 5명의 사용자 선택
        const top5Users = uniqueUsers.slice(0, 5);
        result.data = {'최근 접속자 목록': top5Users,};

    } catch (err) {
        console.log(err)
        result.message = err.message
    } finally {
        res.send(result)
    }
});

module.exports = router