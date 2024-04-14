// 이미지 validator 다시 만들고 테스트 해보기!!허걱
// multer 안에 포함되어있는 기능 쓰기(다시 찾아보시오)

const router = require("express").Router()

const imageValidate = (req, res, next) => {
    const result = {
        "success" : false,
        "message" : "",
    }
    try {
        // if (!req.file) {
        //     throw new Error('이미지가 업로드되지 않았습니다');
        // }

        console.log(req.image)

        // 파일 MIME 타입 검사
        // 파일 MIME 타입 검사 : 파일의 형식을 설명하는 미디어 타입
        // 허용되는 이미지 파일의 MIME 타입이 포함하는 배열
        // 주로 사용되는 JPEG 및 PNG 포맷
        const allowedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png'];
        // mime 라이브러리를 사용하여 업로드된 파일의 MIME 타입을 가져오기
        // 업로드된 파일의 원본 파일명을 기반으로 MIME 타입을 확인
        const mimeType = mime.lookup(req.file.originalname);
        // 가져온 MIME 타입이 허용된 이미지 파일의 MIME 타입 중 하나인지를 확인
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new Error('잘못된 파일 유형입니다');
        }

        // 파일 확장자 검사
        // 허용된 파일 확장자를 지정하는 배열
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        // path.extname() 함수를 사용하여 업로드된 파일의 경로에서 확장자 부분을 추출
        // 대소문자 구분 없이 확장자를 비교하기 위해 소문자로 변환
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error('잘못된 파일 확장자입니다');
        }

        // 파일 크기 검사
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxFileSize) {
            throw new Error('파일 크기는 5MB 이하여야 합니다');
        }

        result.success = true;

        next();
    } catch (err) {
        console.log(err)
        result.message = err.message;
    }finally{
        res.send(result)
    }
};

module.exports = imageValidate