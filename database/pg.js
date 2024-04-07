const { Pool } = require('pg');

// Postgre 연결 정보
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Postgre와의 연결 상태 확인
async function checkDatabaseConnection() {
    try {
        const client = await pool.connect();
        console.log('Postgre 연결 성공');
    } catch (err) {
        console.error('Postgre 연결 안됨:', err.message);
    }
}

// Postgre 연결 함수 호출
checkDatabaseConnection();

module.exports = pool;