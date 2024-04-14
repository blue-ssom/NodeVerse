const multer = require('multer');

// 여기서 예외처리 추가할 수 있음
// 우리가 쓰는 방식으로 바꿔오기(람다형식으로)
// 파일 이름 uuid써서 바꾸기

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/img'); // 파일 저장 경로 지정
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // 파일 이름을 기존 파일명으로 지정
    }
});

const uploader = multer({ storage: storage });

module.exports = uploader;