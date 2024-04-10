// 알림과 관련된 API

const express = require('express');
const router = express.Router();
const mongodb = require('../../database/mongodb');
// const checkLogin = require('../middlewares/checkLogin');
// const jwt = require("jsonwebtoken")

// 알림 조회
router.get('/', async (req, res) => {
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }

    try {
        // Aggregation Framework를 사용하여 알림 데이터 필터링 및 조인
        const notifications = await mongodb.db("notification_system").collection("notification").aggregate([
            {
                // Aggregation Framework에서는 $match를 사용하여 조건을 지정
                $match: {
                    $or: [
                        { type: 'post' },
                        { type: 'like', userIdx: 1 },
                        { type: 'comment', userIdx: 1 }
                    ]
                }
            },
        ]).sort({ createdAt: -1 }).toArray();
        
        result.success = true;
        result.message = "알림 조회 성공";
        result.data = notifications;

    } catch (err) {
        console.log(err)
    } finally {
        res.send(result)
    }
});

module.exports = router;