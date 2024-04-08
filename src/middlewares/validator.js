const { body, validationResult } = require('express-validator');

// 사용자 정보 유효성 검사 미들웨어
const validateUser = [
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
        .isEmail().withMessage('올바른 이메일 형식이 아닙니다.'),

    // 주소 검사
    body('address')
        .notEmpty().withMessage('주소를 입력하세요.')
        .isLength({ min: 5, max: 100 }).withMessage('주소는 최소 5자 이상 최대 100자 이하여야 합니다.')
        .matches(/^[A-Za-z\s]+$/).withMessage('주소는 영문 대소문자로만 이루어져야 합니다.')
];

// 사용자 정보 유효성 검사 결과 반환
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // 유효성 검사 통과 시 다음 미들웨어 호출
};

module.exports = {
    validateUser,
    validate
};