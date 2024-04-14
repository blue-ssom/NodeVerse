// Express-validator : 요청이나 데이터들이 유효한지 확인하는 유효성 검사 모듈
// 코드만 봐도 직관적이고, 어떤 부분의 유효성을 검사하는지 알 수 있음, 통일성 있게 구성할 수 있음
const { body, validationResult } = require('express-validator');

const loginValidate = [
    body('id')
        .notEmpty().withMessage('아이디를 입력하세요.')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('아이디는 영문자와 숫자로만 이루어져야 합니다.')
        .isLength({ min: 4, max: 10 }).withMessage('아이디는 4자 이상 10자 이하여야 합니다.'),
    
    // 비밀번호 유효성 검사 규칙
    body('password')
        .notEmpty().withMessage('비밀번호를 입력하세요.')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('비밀번호는 영문자와 숫자로만 이루어져야 합니다.')
        .isLength({ min: 4, max: 16 }).withMessage('비밀번호는 ４자 이상 16자 이하여야 합니다.'),
]

const findIdValidate = [
    // 이름 유효성 검사 규칙
    body('name')
        .notEmpty().withMessage('이름을 입력하세요.')
        .isLength({ min: 2, max: 30 }).withMessage('이름은 최소 2자 이상 최대 30자 이하여야 합니다.')
        .matches(/^[A-Za-z]+$/).withMessage('이름은 영문 대소문자로만 이루어져야 합니다.'),

    // 전화번호 유효성 검사 규칙
    body('phoneNumber')
        .notEmpty().withMessage('전화번호를 입력하세요.')
        .isLength({ min: 11, max: 11 }).withMessage('전화번호는 11자여야 합니다.')
        .matches(/^\d+$/).withMessage('전화번호는 숫자로만 이루어져야 합니다.'),
]

const findPasswordValidate = [
    body('id')
        .notEmpty().withMessage('아이디를 입력하세요.')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('아이디는 영문자와 숫자로만 이루어져야 합니다.')
        .isLength({ min: 4, max: 10 }).withMessage('아이디는 4자 이상 10자 이하여야 합니다.'),

    body('name')
    .notEmpty().withMessage('이름을 입력하세요.')
    .isLength({ min: 2, max: 30 }).withMessage('이름은 최소 2자 이상 최대 30자 이하여야 합니다.')
    .matches(/^[A-Za-z]+$/).withMessage('이름은 영문 대소문자로만 이루어져야 합니다.'),

    // 전화번호 유효성 검사 규칙
    body('phoneNumber')
        .notEmpty().withMessage('전화번호를 입력하세요.')
        .isLength({ min: 11, max: 11 }).withMessage('전화번호는 11자여야 합니다.')
        .matches(/^\d+$/).withMessage('전화번호는 숫자로만 이루어져야 합니다.'),
]

const updateUserInfoValidate = [
     // 비밀번호 유효성 검사 규칙
     body('password')
     .notEmpty().withMessage('비밀번호를 입력하세요.')
     .matches(/^[a-zA-Z0-9]+$/).withMessage('비밀번호는 영문자와 숫자로만 이루어져야 합니다.')
     .isLength({ min: 8, max: 16 }).withMessage('비밀번호는 8자 이상 16자 이하여야 합니다.'),

 // 이름 유효성 검사 규칙
 body('name')
     .notEmpty().withMessage('이름을 입력하세요.')
     .isLength({ min: 2, max: 30 }).withMessage('이름은 최소 2자 이상 최대 30자 이하여야 합니다.')
     .matches(/^[A-Za-z]+$/).withMessage('이름은 영문 대소문자로만 이루어져야 합니다.'),

 // 전화번호 유효성 검사 규칙
 body('phoneNumber')
     .notEmpty().withMessage('전화번호를 입력하세요.')
     .isLength({ min: 11, max: 11 }).withMessage('전화번호는 11자여야 합니다.')
     .matches(/^\d+$/).withMessage('전화번호는 숫자로만 이루어져야 합니다.'),

 // 이메일 유효성 검사 규칙
 body('email')
     .notEmpty().withMessage('이메일을 입력하세요.')
     // isEmail : 이메일 주소 형식 확인 localpart@[domain part]
     .isEmail().withMessage('올바른 이메일 형식이 아닙니다.'),

 // 주소 검사
 body('address')
     .notEmpty().withMessage('주소를 입력하세요.')
     .isLength({ min: 5, max: 100 }).withMessage('주소는 최소 5자 이상 최대 100자 이하여야 합니다.')
     .matches(/^[A-Za-z\s]+$/).withMessage('주소는 영문 대소문자로만 이루어져야 합니다.')
] 

const signUpValidate = [
    // 아이디 유효성 검사 규칙
    body('id')
        .notEmpty().withMessage('아이디를 입력하세요.')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('아이디는 영문자와 숫자로만 이루어져야 합니다.')
        .isLength({ min: 4, max: 10 }).withMessage('아이디는 4자 이상 10자 이하여야 합니다.'),
    
    // 비밀번호 유효성 검사 규칙
    body('password')
        .notEmpty().withMessage('비밀번호를 입력하세요.')
        .matches(/^[a-zA-Z0-9]+$/).withMessage('비밀번호는 영문자와 숫자로만 이루어져야 합니다.')
        .isLength({ min: 8, max: 16 }).withMessage('비밀번호는 8자 이상 16자 이하여야 합니다.'),

    // 이름 유효성 검사 규칙
    body('name')
        .notEmpty().withMessage('이름을 입력하세요.')
        .isLength({ min: 2, max: 30 }).withMessage('이름은 최소 2자 이상 최대 30자 이하여야 합니다.')
        .matches(/^[A-Za-z]+$/).withMessage('이름은 영문 대소문자로만 이루어져야 합니다.'),

    // 전화번호 유효성 검사 규칙
    body('phoneNumber')
        .notEmpty().withMessage('전화번호를 입력하세요.')
        .isLength({ min: 11, max: 11 }).withMessage('전화번호는 11자여야 합니다.')
        .matches(/^\d+$/).withMessage('전화번호는 숫자로만 이루어져야 합니다.'),

    // 이메일 유효성 검사 규칙
    body('email')
        .notEmpty().withMessage('이메일을 입력하세요.')
        // isEmail : 이메일 주소 형식 확인 localpart@[domain part]
        .isEmail().withMessage('올바른 이메일 형식이 아닙니다.'),

    // 주소 검사
    body('address')
        .notEmpty().withMessage('주소를 입력하세요.')
        .isLength({ min: 5, max: 100 }).withMessage('주소는 최소 5자 이상 최대 100자 이하여야 합니다.')
        .matches(/^[A-Za-z\s]+$/).withMessage('주소는 영문 대소문자로만 이루어져야 합니다.')
];

// 제목 유효성 검사 미들웨어
const titleValidate = [
    body('title')
        .notEmpty().withMessage('제목을 입력하세요.')
        .isLength({ min: 1, max: 50 }).withMessage('제목은 1자 이상 50자 이하여야 합니다.')
        .custom((value, { req }) => {
            // 제목에 공백만 있는지 확인
            if (value.trim() === '') {
                throw new Error('제목은 공백 문자만으로 이루어질 수 없습니다.');
            }
            return true;
        })
];

// 내용 유효성 검사 미들웨어
const contentValidate = [
    body('content')
        .notEmpty().withMessage('내용을 입력하세요.')
        .isLength({ min: 1, max: 100 }).withMessage('내용은 1자 이상 100자 이하여야 합니다.')
        .custom((value, { req }) => {
            // 내용에 공백만 있는지 확인
            if (value.trim() === '') {
                throw new Error('내용은 공백 문자만으로 이루어질 수 없습니다.');
            }
            return true;
        })
];

// 검사 미들웨어 분리
// 사용자 정보 유효성 검사 결과 반환
const validate = (req, res, next) => {
    const errors = validationResult(req);
    // 에러가 존재하는 경우
    if (!errors.isEmpty()) {
        // 400 : 클라이언트 오류를 감지해 요청을 처리할 수 없거나, 하지 않는다는 것을 의미
        // 클라이언트가 서버로 전송한 데이터가 요구사항을 충족하지 않거나 유효성 검사를 통과하지 못한 경우 에러들을 배열형태로 반환
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // 유효성 검사 통과 시 다음 미들웨어 호출
};

module.exports = {
    loginValidate,
    findIdValidate,
    findPasswordValidate,
    updateUserInfoValidate,
    signUpValidate,
    titleValidate,
    contentValidate,
    validate
};