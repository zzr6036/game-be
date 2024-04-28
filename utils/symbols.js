const axios = require("axios");

const baseURL = "https://api.kucoin.com";

const getSymbols = async () => {
    try {
        const response = await axios.get(baseURL + "/api/v1/symbols");

        if (response.data.code == "200000") {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log(error.response.body);
    }
};

const getOrderbook = async (params) => {
    console.log(params);
    try {
        const response = await axios.get(baseURL + "/api/v1/market/orderbook/level2_100", {
            params: params,
        });

        if (response.data.code == "200000") {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log(error.response.data);
        return null;
    }
};

const getKucoinToken = async () => {
    try {
        const response = await axios.post(baseURL + "/api/v1/bullet-public");

        if (response.data.code == "200000") {
            return response.data.data;
        }
        return null;
    } catch (error) {
        console.log(error.response.body);
    }
};

module.exports = {
    getSymbols: getSymbols,
    getOrderbook: getOrderbook,
    getKucoinToken: getKucoinToken,
};
