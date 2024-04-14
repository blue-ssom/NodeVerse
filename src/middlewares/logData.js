const mongodb = require('../../database/mongodb');

async function logData(req, res, next) {
    // 요청 정보를 MongoDB에 저장
    const logEntry = {
        userIdx: req.decoded.idx,
        ip: req.ip,
        api: req.originalUrl,
        request: req.body,
        response: res.result, 
        timestamp: new Date()
    };

     // res.on()을 사용하여 응답이 완료될 때 로깅 수행
     // 요청에 대한 응답이 완료되는 시점에 이벤트를 트리거하여 로깅을 수행
     res.on('finish', async () => {
        try {
            // 응답 정보를 MongoDB에 저장
            await mongodb.db("notification_system").collection("log_history").insertOne(logEntry);
            console.log("로그 데이터 저장 완료:", logEntry);
        } catch (err) {
            console.log(err);
        }
    });
    
    next(); // 다음 미들웨어로 이동
}

module.exports = logData;