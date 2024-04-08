// 게시글과 관련된 API
const express = require('express');
const router = express.Router();
const pg = require('../../database/pg')
const mongodb = require("../../database/mongodb")
// const checkLogin = require('../middlewares/checkLogin');
// const jwt = require("jsonwebtoken")
const { validateTitle, validateContent, validateUser, validate } = require('../middlewares/validator');

// ***** 게시글 관련 *****
// 게시글 추가 C
router.post('/', validateTitle, validateContent, validate, async(req, res) => {
    const { title, content, categoryIdx } = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        // 게시글 추가(PostgreSQL)
        const postInsertInfoSQL = `
        INSERT INTO scheduler.post (user_idx, title, content, creationdate, updationdate) 
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING post_idx;
        `;
        const postInsertResult = await pg.query(postInsertInfoSQL, [1, title, content]);
        const postIdx = postInsertResult.rows[0].post_idx; // 새로 추가된 게시글의 ID

        // 카테고리 추가(PostgreSQL)
        const categoryInsertSQL = `
            INSERT INTO scheduler.post_category (post_idx, category_idx)
            VALUES ($1, $2);
        `;
        await pg.query(categoryInsertSQL, [postIdx, categoryIdx]);

        // 알림 추가(MongoDB)
        await mongodb.db("notification_system").collection("notification").insertOne({
            message: `새로운 게시글 추가되었습니다.`,
            user: {
                _id : 1,
                id : 'Somi'
            },
            post_id: postIdx,
            createdAt: new Date(),
            type: "post"
        });

        result.success = true;
        result.message = "게시글 작성 성공";
        result.data = {
            "post_idx": postIdx,
            "title": title,
            "content": content,
            "categoryIdx":categoryIdx
        };

    } catch(err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 게시글 조회 R
router.get('/all', async (req, res) => {
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        // 게시글 조회
        const sql = `SELECT * FROM scheduler.post ORDER BY updationdate DESC`;
        const data = await pg.query(sql);
        const row = data.rows
        
        result.success = true;
        result.message = "게시글 조회 성공",
        result.data = row

    } catch(err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 게시글 수정 U
// 게시글 삭제 D
// 게시글 좋아요
// 게시글 좋아요 취소

// ***** 댓글 관련 ******
// 댓글 추가 C 
// 댓글 삭제 R
// 댓글 수정 U
// 댓글 삭제 D
// 댓글 좋아요
// 댓글 좋아요 취소

module.exports = router;