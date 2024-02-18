const mongoose = require("mongoose");
const { User } = require("../src/module/model");
const { secretKey } = require("../config");
const jwt = require("jsonwebtoken");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            throw new Error("Authorization token is missing or invalid");
        }
        const token = authHeader.substring("Bearer ".length);
        console.log("token--------------------->>", token);
        const decoded = jwt.verify(token, secretKey);
        console.log("decoded====================>>", decoded);
        const userData = await User.findOne({ _id: decoded.id });
        console.log("userData------------------>>", userData);
        if (!userData) {
            throw new Error("User data not found");
        }
        req.user = userData;
        next();
    } catch (error) {
        console.error("Error:", error);
        res.status(401).json({ error: error.message });
    }
};

const errorHandle = (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || "Internal server error";
    res.status(status).json({ error: message });
};

module.exports = {
    authenticate,
    errorHandle
};
