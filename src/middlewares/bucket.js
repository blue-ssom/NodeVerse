const router = require("express").Router()
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3')

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
      this.upload = multer({
        storage: multerS3({
          s3: this.s3,
          bucket: 'smilelyawsbucket',
          contentType: multerS3.AUTO_CONTENT_TYPE,
          key: function (req, file, callback) {
            callback(null, 'uploads/' + file.originalname); 
          }
        })
      });
    }
  
    // 프로필 이미지 업로드 미들웨어
    profileImage(targetFile) {
      return this.upload.single(targetFile);
    }
}

// 프로필 이미지 업로드 API
// router.post('/profile', upload.single('image'), async (req, res) => {
//     const result = {
//         "success" : false,
//         "message" : "",
//         "data" : null
//     }

//     try {
//          // 업로드된 파일 처리 로직 추가
//          if (!req.file || !req.file.key) {
//             throw new Error("Uploaded image key not found");
//         }

//         // 업로드된 파일 처리 로직 추가
//         const profileImageKey = req.file.key; // S3에 업로드된 이미지의 키


//         result.success = true;
//         result.message = "Profile image uploaded successfully";
//         result.data = profileImageKey;
//     } catch (err) {
//         result.message = err.message;
//     }finally {
//         res.send(result);
//     }
// });


// export 작업
module.exports = UploadBucket;