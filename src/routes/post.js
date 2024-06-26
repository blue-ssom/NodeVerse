// 게시글과 관련된 API

const express = require('express');
const router = express.Router();
const pg = require('../../database/pg')
const mongodb = require("../../database/mongodb")
const checkLogin = require('../middlewares/checkLogin');
const jwt = require("jsonwebtoken")
const { validate } = require('../middlewares/validator');

// ***** 게시글 관련 *****
// 게시글 추가 C
router.post('/', async(req, res) => {
    console.log("post에서 userIdx : ", req.decoded.idx)
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
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 게시글 조회 R
router.get('/all', async (req, res) => {
    const { title, content, categoryIdx } = req.body
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

        res.result = result;

    } catch(err) {
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 게시글 수정 U
router.put('/:postIdx', async(req, res) => {
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
        console.log(err)
        result.message = err.message;
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
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 게시글 좋아요 및 취소
router.post('/:postIdx/likes', async (req, res) => {
    const postIdx = req.params.postIdx;
    const result = {
        "success" : false,
        "message" : "",
    }

    try {
        // 해당 게시글 좋아요 여부 조회(PostgreSQL)
        const isLikedSQL = `SELECT * FROM scheduler.post_likes WHERE post_idx = $1 AND user_idx = $2`;
        const isLikedResult = await pg.query(isLikedSQL, [postIdx, 1]);

        if(isLikedResult.rows.length === 0){
            // post_likes에 기록이 없다면 좋아요 추가
            const addLikeSQL = `INSERT INTO scheduler.post_likes (post_idx, user_idx) VALUES ($1, $2)`;
            await pg.query(addLikeSQL, [postIdx, userIdx]);

            // 해당 게시물의 likes +1
            const updateLikesSQL = `UPDATE scheduler.post SET likes_count = likes_count + 1 WHERE post_idx = $1`;
            await pg.query(updateLikesSQL, [postIdx]);

            // 해당 게시물의 작성자의 사용자 Idx를 가져오기
            const postAuthorResult = `SELECT user_idx FROM scheduler.post WHERE post_idx = $1`;
            await pg.query(postAuthorResult, [postIdx]);
            const postAuthorIdx = postAuthorResult.rows[0].user_idx;

            // 자신이 작성한 게시글에 좋아요 누른 경우 알림을 추가하지 않음
            if (1 !== postAuthorIdx) {
                console.log(1)
                // 해당 게시물의 작성자에게 알림을 추가
                const notificationMessage = `Somi님이 회원님의 게시글을 좋아합니다.`; // 사용자 ID로 변경할 수 있습니다.
                await pool.db("notification_system").collection("notification").insertOne({
                    post_idx: postIdx,
                    message: notificationMessage,
                    useridx: postAuthorIdx,
                    createdAt: new Date(),
                    type: "like"
                });
            }
        } else {
            console.log(2)
            // post_likes에 기록이 있다면 좋아요 취소
            const removeLikeSQL = `DELETE FROM scheduler.post_likes WHERE post_idx = $1 AND user_idx = $2`;
            await pg.query(removeLikeSQL, [postIdx, userIdx]);

            // 해당 게시물의 likes -1
            const updateLikesSQL = `UPDATE scheduler.post SET likes_count = likes_count - 1 WHERE post_idx = $1 AND likes_count > 0`;
            await pg.query(updateLikesSQL, [postIdx]);
        }

        result.success = true;
        result.message = "좋아요 처리 완료";

    } catch (err) {
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result)
    }
});


// ***** 댓글 관련 ******
// 댓글 추가 C
router.post('/:postIdx/comments', async(req, res) => {
    const postIdx = req.params.postIdx;
    const { content } = req.body;
    const result = {
        "success": false,
        "message": "",
    }

    try{

        // 입력받은 post_idx와 일치하는 게시물이 있는지 확인
        const existingPostQuery = `SELECT * FROM scheduler.post WHERE post_idx = $1`;
        const existingPostResult = await pg.query(existingPostQuery, [postIdx]);

        if (existingPostResult.rows.length === 0) {
            throw new Error("해당하는 게시물이 존재하지 않습니다.");
        }

        // 댓글 추가
        const addCommentQuery = `
        INSERT INTO scheduler.comment (post_idx, user_idx, content)
        VALUES ($1, $2, $3)
        `;
        await pg.query(addCommentQuery, [postIdx, 1, content]);
        
        // 게시글 작성자 조회
        const postAuthorQuery = `SELECT user_idx FROM scheduler.post WHERE post_idx = $1`;
        const postAuthorResult = await pg.query(postAuthorQuery, [postIdx]);
        const postAuthorIdx = postAuthorResult.rows[0].user_idx;

        // 자신이 작성한 게시글에 댓글을 작성한 경우 알림을 추가하지 않음
        if (postAuthorIdx !== 1) {
            const notificationMessage = `게시글에 댓글이 추가되었습니다.`;
            const notification = {
                post_idx: postIdx,
                user_idx: postAuthorIdx,
                message: notificationMessage,
                created_at: new Date(),
                type: "comment"
            };
            // MongoDB에 알림 추가
            await pool.db("notification_system").collection("notification").insertOne(notification);
        };

        result.success = true;
        result.message = "댓글 추가 성공";

    } catch (err) {
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result)
    }
});

// 댓글 조회 R
router.get('/:postIdx/comments', async (req, res) => {
    const postIdx = req.params.postIdx;
    const result = {
        "success": false,
        "message": "",
    }

    try{

        // 입력받은 post_idx와 일치하는 게시물이 있는지 확인
        const existingPost = `SELECT * FROM scheduler.post WHERE post_idx = $1`;
        const existingPostResult = await pg.query(existingPost, [postIdx]);

        if (existingPostResult.rows.length === 0) {
            throw new Error("해당하는 게시물이 존재하지 않습니다.");
        }

        const sql = `SELECT * FROM scheduler.comment where post_idx = $1`;
        const data = await pg.query(sql,[postIdx]);
        const row = data.rows

        result.success = true;
        result.message = "댓글 조회 성공";
        result.data = row

    } catch (err) {
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result)
    }
})

// 댓글 수정 U
router.put('/:postIdx/comments/:commentIdx', async (req, res) => {
    const postIdx = req.params.postIdx;
    const commentIdx = req.params.commentIdx;
    const { content } = req.body;
    const result = {
        "success": false,
        "message": "",
    };

    try {

        // 입력받은 post_idx와 일치하는 게시물이 있는지 확인
        const existingPost = `SELECT * FROM scheduler.post WHERE post_idx = $1`;
        const existingPostResult = await pg.query(existingPost, [postIdx]);

        if (existingPostResult.rows.length === 0) {
            throw new Error("해당하는 게시물이 존재하지 않습니다.");
        }

        // 댓글이 존재하는지 확인
        const existingComment = `SELECT * FROM scheduler.comment WHERE comment_idx = $1`;
        const existingCommentResult = await pg.query(existingComment, [commentIdx]);

        if (existingCommentResult.rows.length === 0) {
            throw new Error("해당하는 댓글이 존재하지 않습니다.");
        }

        const sql = `UPDATE scheduler.comment SET content = $1 WHERE comment_idx = $2`;
        const data = await pg.query(sql,[content, commentIdx]);

        result.success = true;
        result.message = "댓글 수정 성공";

    } catch (err) {
        console.log(err);
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 댓글 삭제 D
router.delete('/:postIdx/comments/:commentIdx', async (req, res) => {
    const postIdx = req.params.postIdx;
    const commentIdx = req.params.commentIdx;
    const result = {
        "success": false,
        "message": "",
    }

    try {
        // 입력받은 post_idx와 일치하는 게시물이 있는지 확인
        const existingPost = `SELECT * FROM scheduler.post WHERE post_idx = $1`;
        const existingPostResult = await pg.query(existingPost, [postIdx]);

        if (existingPostResult.rows.length === 0) {
            throw new Error("해당하는 게시물이 존재하지 않습니다.");
        }

        // 댓글이 존재하는지 확인
        const existingComment = `SELECT * FROM scheduler.comment WHERE comment_idx = $1`;
        const existingCommentResult = await pg.query(existingComment, [commentIdx]);

        if (existingCommentResult.rows.length === 0) {
            throw new Error("해당하는 댓글이 존재하지 않습니다.");
        }

        const deleteCommentSQL = `
            DELETE FROM scheduler.comment
            WHERE comment_idx = $1 AND post_idx = $2
        `;
        const deleteCommentResult = await pg.query(deleteCommentSQL, [commentIdx, postIdx]);

        result.success = true;
        result.message = "댓글 삭제 성공";

    } catch (err) {
        console.log(err);
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

// 댓글 좋아요 및 취소
router.post('/:postIdx/comments/:commentIdx/likes', async (req, res) => {
    const postIdx = req.params.postIdx;
    const commentIdx = req.params.commentIdx;
    const result = {
        "success" : false,
        "message" : "",
    }

    try {
        // 입력받은 post_idx와 일치하는 게시물이 있는지 확인
        const existingPost = `SELECT * FROM scheduler.post WHERE post_idx = $1`;
        const existingPostResult = await pg.query(existingPost, [postIdx]);

        if (existingPostResult.rows.length === 0) {
            throw new Error("해당하는 게시물이 존재하지 않습니다.");
        }

        // 댓글이 존재하는지 확인
        const existingComment = `SELECT * FROM scheduler.comment WHERE comment_idx = $1`;
        const existingCommentResult = await pg.query(existingComment, [commentIdx]);

        if (existingCommentResult.rows.length === 0) {
            throw new Error("해당하는 댓글이 존재하지 않습니다.");
        }

        // 해당 댓글 좋아요 여부 조회(PostgreSQL)
        const isLikedSQL = `SELECT * FROM scheduler.comment_likes WHERE comment_idx = $1 AND user_idx = $2`;
        const isLikedResult = await pg.query(isLikedSQL, [commentIdx, 1]);

        if(isLikedResult.rows.length === 0){
            // comment_likes에 기록이 없다면 좋아요 추가
            const addLikeSQL = `INSERT INTO scheduler.comment_likes (comment_idx, user_idx) VALUES ($1, $2)`;
            await pg.query(addLikeSQL, [commentIdx, 1]);

            // 해당 댓글의 likes +1
            const updateLikesSQL = `UPDATE scheduler.comment SET likes_count = likes_count + 1 WHERE comment_idx = $1`;
            await pg.query(updateLikesSQL, [commentIdx]);

            // 게시글 작성자 조회
            const postAuthorQuery = `SELECT user_idx FROM scheduler.post WHERE post_idx = $1`;
            const postAuthorResult = await pg.query(postAuthorQuery, [postIdx]);
            const postAuthorIdx = postAuthorResult.rows[0].user_idx;

            // 자신이 작성한 댓글에 좋아요 누른 경우 알림을 추가하지 않음
            if (1 !==  postAuthorIdx) {
                console.log(1)
                // 해당 댓글의 작성자에게 알림을 추가
                const notificationMessage = `Somi님이 회원님의 댓글을 좋아합니다.`;
                await pool.db("notification_system").collection("notification").insertOne({
                    post_idx: postIdx,
                    message: notificationMessage,
                    userIdx: postAuthorIdx,
                    createdAt: new Date(),
                    type: "like"
                });
            }
        } else {
            console.log(2)
            // comment_likes에 기록이 있다면 좋아요 취소
            const removeLikeSQL = `DELETE FROM scheduler.comment_likes WHERE comment_idx = $1 AND user_idx = $2`;
            await pg.query(removeLikeSQL, [commentIdx, 1]);

            // 해당 댓글의 likes -1
            const updateLikesSQL = `UPDATE scheduler.comment SET likes_count = likes_count - 1 WHERE comment_idx = $1 AND likes_count > 0`;
            await pg.query(updateLikesSQL, [commentIdx]);
        }

        result.success = true;
        result.message = "댓글 좋아요 처리 완료";

    } catch (err) {
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result)
    }
});

module.exports = router;