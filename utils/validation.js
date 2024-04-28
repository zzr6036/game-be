const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const jwt = require("jsonwebtoken");

function generateJWT(tokenData) {
    const token = jwt.sign({ data: tokenData }, config.jwtSecret, {
        expiresIn: config.jwtExpireIn,
    });
    return token;
}

function authenticateToken(req, res, next) {
    const authCookie = req.cookies["access_token"];
    if (authCookie == null || authCookie === "") {
        return res.cookie("access_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
            .status(401)
            .send({
                status: "Unauthorised",
                message: "Please login again!",
            });
    }
    jwt.verify(authCookie, config.jwtSecret, (err, tokenData) => {
        req.tokenData = null;
        if (err) {
            return res.cookie("access_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
                .status(401)
                .send({
                    status: "Unauthorised",
                    message: "Please login again!",
                });
        }

        req.tokenData = tokenData;
        next();
    });
}

module.exports = {
    generateJWT: generateJWT,
    authenticateToken: authenticateToken,
};
