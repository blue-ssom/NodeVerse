const mongodb = require('../../database/mongodb');

async function logData(req, res, next) {
    const result = {
        "success" : false,
        "message" : "",
        "data" : null
    }
    // 요청 정보를 MongoDB에 저장
    const logEntry = {
        userIdx: req.decoded.idx,
        ip: req.ip,
        api: req.originalUrl,
        request: req.body,
        response: res.result || {}, // 존재하지 않으면 빈 객체로 대체
        timestamp: new Date()
    };

    try {
        // 요청 정보를 MongoDB에 저장
        await mongodb.db("notification_system").collection("notification").insertOne(logEntry);

        result.success = true;
        result.message = "로그 데이터 저장 완료";
        result.data = logEntry;

    } catch (err) {
        console.log(err)
        result.message = err.message;
    } finally {
        res.send(result)
    }
    next(); // 다음 미들웨어로 이동
}

module.exports = logData;