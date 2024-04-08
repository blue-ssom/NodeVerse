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
        .isLength({ min: 8, max: 16 }).withMessage('비밀번호는 8자 이상 16자 이하여야 합니다.')
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