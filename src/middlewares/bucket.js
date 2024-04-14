const router = require("express").Router()
// aws-sdk : AWS의 다양한 서비스를 프로그래밍 방식으로 제어하기 위한 라이브러리
// EC2 인스턴스 관리, S3 버킷 관리, RDS 데이터베이스 조작 등 AWS 클라우드 서비스를 프로그래밍 방식으로 제어
// 처음부터 새로 만드는 대신 SDK에서 제공하는 코드 라이브러리, 디버거 또는 기타 필수 도구를 사용
// SDK를 사용하면 최소한의 코딩으로 라이브러리에서 템플릿을 가져와서 사용 가능
// 소프트웨어 개발 키트(SDK) : 개발자를 위한 플랫폼별 구축 도구 세트, 개발자가 선호하는 언어로 애플리케이션을 쉽게 구축
const AWS = require('aws-sdk');
// multer : express 미들웨어
// HTTP 요청을 통해 업로드된 파일을 쉽게 처리, 옵션 다양
const multer = require('multer');
// multer-s3 : aws s3에 파일을 업로드 하는 기능 제공, Multer와 AWS S3를 결합한 모듈
const multerS3 = require('multer-s3')
// 둘이 같이 사용하는 이유 : Multer를 통해 파일 업로드를 처리하고, Multer-S3를 사용하여 업로드된 파일을 AWS S3에 저장

class UploadBucket {
    constructor() {
        // 자격증명 설정
        AWS.config.update({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'ap-northeast-2',
        });

        // S3 클라이언트 생성
        this.s3 = new AWS.S3();

        // Multer-S3 설정
        // Multer 인스턴스를 생성하고, storage 옵션을 설정
        this.upload = multer({
        storage: multerS3({
            s3: this.s3,
            bucket: 'smilelyawsbucket',
            // Multer-S3가 자동으로 업로드된 파일의 컨텐츠 유형을 감지하고 해당 유형에 맞는 MIME 타입을 설정
            // 컨텐츠 유형을 정확히 지정할 필요 없이 간편하게 파일을 업로드할 수 있음
            contentType: multerS3.AUTO_CONTENT_TYPE,
            // 업로드된 파일이 AWS S3에 저장될 때 사용될 파일의 키를 생성
            key: function (req, file, callback) {
            callback(null, 'uploads/' + file.originalname); 
            }
        })
        });
    }
  
    // 프로필 이미지 업로드 미들웨어
    // single 미들웨어 함수는 Multer-S3에서 제공하는 함수 중 하나로, 단일 파일을 업로드하는 데 사용
    profileImage(targetFile) {
      return this.upload.single(targetFile);
    }
}

// export 작업
module.exports = UploadBucket;