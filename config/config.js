const dotenv = require("dotenv");
dotenv.config();

// basic config
module.exports = {
    development: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpireIn: process.env.JWT_REFRESH_EXPIRATION,
        serverPort: process.env.PORT_DEV,
    },
    test: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpireIn: process.env.JWT_REFRESH_EXPIRATION,
        serverPort: process.env.PORT_TEST,
    },
    production: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpireIn: process.env.JWT_REFRESH_EXPIRATION,
        serverPort: process.env.PORT_PROD,
    },
};
