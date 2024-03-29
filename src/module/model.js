const mongoose = require("mongoose");
const { secretKey } = require("../../config");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String
    },
    // addresh: addresh,
    date: {
        type: Date
    }
}, {
    timestamps: true,
    versionKey: false
});
userSchema.statics.findByToken = async function (token) {
    try {
        const decodedtoken = jwt.verify(token, secretKey);
        if (!decodedtoken) throw "invalited token find";
        const user = await this.findByToken(decodedtoken.id);
        if (!user) throw "user data not find";
        return user();
    } catch (error) {
        console.log("error------------------->>", error);
        throw "error message"
    };
};
userSchema.methods.comparePassword = async function (interedPassword) {
    return bcrypt.compare(interedPassword, this.password)
};
const User = mongoose.model("User", userSchema);
module.exports = { User };