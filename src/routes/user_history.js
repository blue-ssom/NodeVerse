const pool = require("../../database/pg");
const redis = require("redis").createClient();
const schedule = require('node-schedule'); // Node.js에서 스케줄링 작업을 수행하기 위한 모듈

process.env.TZ = 'Asia/Seoul'; // 한국 시간대로 설정

// 매일 자정에 실행되는 스케줄링 설정
const midnightSchedule = schedule.scheduleJob('0 0 * * *', async () => {
    try {
        // 현재 날짜 구하기
        const today = new Date();
        today.setDate(today.getDate() - 1); // 하루 뺀 날짜로 설정

        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();
        const dateString = `${year}-${month}-${day}`;

        // 오늘의 로그인 수 가져오기
        const loginCount = await redis.sCardAsync('today');

       // PostgreSQL에 히스토리 저장
       const sql = 'INSERT INTO login_history (date, login_count) VALUES ($1, $2)';
       const data = await pool.query(sql, [dateString, loginCount]);

        // 오늘의 로그인 수 초기화
        await redis.del('today');
        await redis.del('user_login');

        console.log(`[${dateString}] 로그인 수: ${loginCount}, 히스토리에 저장되었습니다.`);
    } catch (err) {
        console.log(err)
    }
});
