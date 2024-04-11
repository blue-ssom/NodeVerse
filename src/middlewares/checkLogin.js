// Token의 유효성 검사
const jwt = require("jsonwebtoken")

const checkLogin = async (req, res, next) => {
    const { token } = req.headers
    const result = {
        "success" : false,
        "message" : "",
    }

    try {
        // 1. Token이 조작되지 않았는지
       const LoginResult = jwt.verify(token, process.env.TOKEN_SECRET_KEY)
       // 해당 토큰의 해독된 내용이 req.decoded에 저장
       req.decoded = LoginResult

        next();

    } catch(err) {
        console.log(err)

        // 1. jwt must be provided" / 2. jwt expired / 3. invalid token
        if(err.message === "jwt must be provided") result.message = "로그인이 필요합니다."
        else if(err.message === "jwt expired") result.message = "세션이 만료되었습니다. 다시 로그인해주세요."
        else if(err.message === "invalid token") result.message = "정상적이지 않은 접근입니다."
        else result.message = err.message

        res.send(result)
    }
}

module.exports = checkLogin