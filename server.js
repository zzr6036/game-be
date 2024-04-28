var bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/config/config.js")[env];
const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const validation = require("./utils/validation");
const symbols = require("./utils/symbols");
const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3001' }));
app.use(cookieParser());

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = http.createServer(app);

const isSecure = () => {
    return process.env.NODE_ENV === "production";
};

app.get("/api", (req, res) => {
    res.send("<h1>Authenticator API Server!</h1>");
});

app.get("/api/v1/symbols", async (req, res) => {
    symbolsList = await symbols.getSymbols();
    let result = symbolsList.map((cryptoData) => {
        return cryptoData.symbol;
    });

    result.sort();

    if (result.length == 0) {
        res.status(400).send({
            status: "Unsuccessful",
            message: "Failed to retrieve data from kucoin",
        });
        return;
    }

    res.status(200).send({
        status: "Successful",
        message: "",
        data: result,
    });
});

app.post("/api/v1/login", async (req, res) => {
    const { symbol,
        pin } = req.body;
    if (pin === process.env.PIN) {
        symbolsList = await symbols.getSymbols();

        let result = symbolsList.filter((cryptoData) => {
            return cryptoData.symbol == symbol;
        });

        if (result.length == 0) {
            res.cookie("access_token", "", {
                httpOnly: true,
                secure: isSecure(),
            })
                .status(400)
                .send({
                    status: "Unsuccessful",
                    message: "Invalid Symbol!",
                });
            return;
        }

        let jwtToken = validation.generateJWT({ symbol: symbol });
        const websocketToken = await symbols.getKucoinToken();
        const response = {
            symbol,
            symbolInfo: { ...result[0] },
            kucoinTokenInfo: websocketToken,
        }
        res.cookie("access_token", jwtToken, {
            httpOnly: true,
            secure: isSecure(),
        })
            .status(200)
            .send({
                status: "Successful",
                data: response,
            });
    } else {
        res.cookie("access_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
            .status(400)
            .send({
                status: "Unsuccessful",
                message: `Fail to login Symbol:${symbol}`,
            });
    }
});
app.post("/api/v1/logout", validation.authenticateToken, async (req, res) => {
    if (req.tokenData === null) {
        res.cookie("access_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
            .status(401)
            .send({
                status: "Unsuccessful",
                message: "Fail to logout, You are not logged in!",
            });
    } else {
        res.cookie("access_token", "", {
            httpOnly: true,
            secure: isSecure(),
        })
            .status(200)
            .send({
                status: "Successful",
                message: req.tokenData.data.symbol + " logout successfully!",
            });
    }
});
app.post("/api/v1/session_validate", validation.authenticateToken, (req, res) => {
    if (req.tokenData === null) {
        res.cookie("access_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
            .status(401)
            .send({
                status: "Unauthorised",
                message: "You are not authorised symbol!",
            });
    } else {
        let jwtToken = validation.generateJWT({ symbol: req.tokenData.data.symbol });
        res.cookie("access_token", jwtToken, {
            httpOnly: true,
            secure: isSecure(),
        })
            .status(200)
            .send({
                status: "Successful",
                message: "Session is good and healthy",
            });
    }
});

app.get("/api/v1/market/orderbook/level2_100", validation.authenticateToken, async (req, res) => {
    if (req.tokenData === null) {
        res.cookie("access_token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        })
            .status(401)
            .send({
                status: "Unauthorised",
                message: "You are not authorised symbol!",
            });
    } else {
        const { symbol } = req.query;
        console.log(req.tokenData);
        console.log(symbol);
        if (symbol != req.tokenData.data.symbol) {
            res.cookie("access_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
                .status(401)
                .send({
                    status: "Unauthorised",
                    message: "You are not authorised symbol!",
                });
        } else {
            orderData = await symbols.getOrderbook({ symbol: symbol });
            let jwtToken = validation.generateJWT({ symbol: symbol });
            res.cookie("access_token", jwtToken, {
                httpOnly: true,
                secure: isSecure(),
            })
                .status(200)
                .send({
                    status: "Successful",
                    message: "",
                    data: orderData,
                });
        }
    }
});

const port = config.serverPort || 3000;

// Endpoint to obtain WebSocket token from KuCoin
app.post("/api/v1/kucoin-token", async (req, res) => {
    // Obtain WebSocket token from KuCoin
    const websocketToken = await symbols.getKucoinToken();
    if (websocketToken != null) {
        res.status(200).send({
            status: "Successful",
            data: websocketToken,
        });
    } else {
        res.status(400).send({
            status: "Unsuccessful",
            message: "Unable to retrieve kucoin token!",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
