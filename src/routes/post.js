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
router.put('/:postIdx', validateTitle, validateContent, validate, async(req, res) => {
    const postIdx = req.params.postIdx; 
    const { title, content, categoryIdx } = req.body
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {

        const updatePostSQL = `
            UPDATE scheduler.post
            SET title = $1, content = $2, updationDate = CURRENT_TIMESTAMP
            WHERE post_idx = $3 AND user_idx = $4
        `;
        const updatePostResult = await pg.query(updatePostSQL, [title, content, postIdx, 1]);

        const updateCategorySQL = `
            UPDATE scheduler.post_category
            SET category_idx = $1
            WHERE post_idx = $2
        `;
        const updateCategoryResult = await pg.query(updateCategorySQL, [categoryIdx, postIdx]);

        // UPDATE 쿼리의 결과로는 실제로 반환되는 행이 없음
        if (updatePostResult.rowCount === 0) {
            throw new Error("게시글 수정에 실패하였습니다.");
        }

        result.success = true;
        result.message = "게시글 수정 성공";
        result.data = rowCount;;
        
    } catch(err) {
        result.message = err.message;
        console.log(err)

    } finally {
        res.send(result);
    }
});

// 게시글 삭제 D
router.delete('/:postIdx', async(req, res) => {
    const postIdx = req.params.postIdx; 
    console.log("postIdx : ", postIdx)
    const result = {
        "success" : false,
        "message" : "",
    }

    try {
        // 게시물을 삭제하기 전에 post_category 테이블에서 해당 게시물의 모든 관련 행 삭제
        const deletePostCategorySQL = `
            DELETE FROM scheduler.post_category
            WHERE post_idx = $1
        `;
        await pg.query(deletePostCategorySQL, [postIdx]);

        // post_category 테이블의 관련 행 삭제 후, 게시물 삭제
        const deletePostSQL = `
            DELETE FROM scheduler.post
            WHERE post_idx = $1 AND user_idx = $2
        `;
        const deletePostResult = await pg.query(deletePostSQL, [postIdx, 1]);
  
        //  DELETE 쿼리의 결과로 행을 반환하지 않음
        // 성공하면 영향을 받은 행의 수를 반환
        if (deletePostResult.rowCount === 0) {
            throw new Error("게시글 삭제에 실패하였습니다.");
        }

        result.success = true;
        result.message = "게시글 삭제 성공";
        
    } catch(err) {
        result.message = err.message;
        console.log(err)
    } finally {
        res.send(result);
    }
});

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