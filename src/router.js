const mongoose = require("mongoose");
const express = require("express");
const { User } = require("../src/module/model");
const { secretKey } = require("../config");
const bcrypt = require("bcrypt");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const jwt = require("jsonwebtoken");
const {authenticate} = require("./authmiddleware");


router.post("/added", async (req, res) => {
    try {
        const newdata = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            date: req.body.date
        };
        // console.log("newdata---------------------->>", newdata);
        const existingUser = await User.findOne({ email: req.body.email });
        console.log("existingUser------------>>", existingUser);
        if (existingUser) {
            return res.status(401).json({
                msg: "email allready register"
            });
        };
        const data = new User(newdata);
        // console.log("data================>>", data);
        if (!data) {
            return res.status(404).json({
                msg: "user data not find"
            });
        };
        const response = await data.save();

        return res.status(200).json({
            msg: "added data sucessfully",
            result: response
        });

    } catch (error) {
        console.log("error------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.post("/register", async (req, res) => {
    try {
        const newdata = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            date: req.body.date
        };
        console.log("newdata------------------->>", newdata);
        const existingUser = await User.findOne({ email: req.body.email });
        console.log("existingUser--------------->>", existingUser);
        if (existingUser) {
            return res.status(401).json({
                msg: "email allready register"
            });
        };
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        newdata.password = hashedPassword;

        const data = new User(newdata);
        const response = await data.save();

        return res.status(200).json({
            msg: "register sucess",
            result: response
        });

    } catch (error) {
        console.log("error-----------------------", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.post("/register1", upload.single("Avatar"), async (req, res) => {
    try {
        const data = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            date: req.body.date
        };
        console.log("data---------------->>", data);
        const existingUser = await User.findOne({ email: req.body.email });
        console.log("existingUser-------->>", existingUser);
        if (existingUser) {
            return res.status(401).json({
                msg: "email allready register"
            });
        };
        const saltRounds = 18;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        data.password = hashedPassword;

        const data1 = new User(data);
        const response = await data1.save();

        return res.status(200).json({
            msg: "okk sucess",
            result: response
        });
    } catch (error) {
        console.log("error------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email: req.body.email });
        console.log("existingUser-------->>", existingUser);
        if (!existingUser) {
            return res.status(401).json({
                msg: "invalited email find"
            });
        };
        const isPasswordMath = await bcrypt.compare(password, existingUser.password);
        console.log("isPasswordMath------------------>>", isPasswordMath);
        if (!isPasswordMath) {
            return res.status(404).json({
                msg: "invalited password find"
            });
        };

        const token = jwt.sign({ id: existingUser._id.toString() }, secretKey);

        return res.status(200).json({
            msg: "login sucess",
            user: existingUser,
            token
        });
    } catch (error) {
        console.log("error------------------------>>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.get("/getByToken", authenticate, async (req, res) => {
    try {
        const UserId = req.user.id;
        console.log("UserId------------------>>", UserId);
        const getdata = await User.findOne({ _id: UserId });
        console.log("getdata--------------------->>", getdata);
        if (!getdata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            result: getdata
        });
    } catch (error) {
        console.log("error--------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.put("/updateByToken", authenticate, async (req, res) => {
    try {
        const UserId = req.user.id;
        console.log("UserId----------------->>", UserId);
        const nodedata = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            date: req.body.date
        };
        console.log("nodedata=======================>>", nodedata);
        const updatedata = await User.findByIdAndUpdate(UserId, { $set: nodedata }, { new: true });
        console.log("updatedata---------------->>>", updatedata);
        if (!updatedata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "updatedata sucessfully",
            result: updatedata
        });
    } catch (error) {
        console.log("error------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.delete("/deleteByToken", authenticate, async (req, res) => {
    try {
        const UserId = req.user.id;
        console.log("UserId------------------->>", UserId);
        const deletedata = await User.findByIdAndDelete(UserId);
        console.log("deletedata---------------->>", deletedata);
        if (!deletedata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "deletedata sucessfully",
            result: deletedata
        });
    } catch (error) {
        console.log("error--------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.put("/reset-password", async (req, res) => {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = req.body;
        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(401).json({
                msg: "incompaleted message find"
            });
        };
        const data = await User.findOne({ email });
        console.log("data-------->>", data);
        if (!data) {
            return res.status(404).json({
                msg: "data is not find"
            });
        };
        const isPasswordMath = await bcrypt.compare(oldPassword, data.password);
        console.log("isPasswordMath------------->>", isPasswordMath);
        if (!isPasswordMath) {
            return res.status(403).json({
                msg: "invalited password find"
            });
        };
        if (newPassword !== confirmPassword) {
            return res.status(401).json({
                msg: "miss match password"
            });
        };
        data.password = await bcrypt.hash(newPassword, 10);
        await data.save();

        return res.status(200).json({
            msg: "okk sucess",
            result: data
        });
    } catch (error) {
        console.log("error--------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.get("/searchWithqueryToken", authenticate, async (req, res) => {
    try {
        const query = req.query;
        const searchdata = await User.find(query);
        console.log("searchdata------------->>", searchdata);
        if (!searchdata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            count: searchdata.length,
            result: searchdata
        });
    } catch (error) {
        console.log("error----------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.get("/searchWithquery", async (req, res) => {
    try {
        const query = req.query;
        const searchdata = await User.find(query);
        console.log("searchdata--------------->>", searchdata);
        if (!searchdata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            count: searchdata.length,
            result: searchdata
        });
    } catch (error) {
        console.log("error---------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.get("/getdata", async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 10;
        const skip=(page-1)*limit
        const reaponse = await User.find().skip(skip).limit(limit).sort({createdAt:-1});
        console.log("reaponse-------------->>", reaponse);
        if (!reaponse) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            count: reaponse.length,
            result: reaponse
        });
    } catch (error) {
        console.log("error-------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.get("/getById/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id------------------------>>", id);
        const getdata = await User.findById(id);
        console.log("getdata------------------>>", getdata);
        if (!getdata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess data",
            result: getdata
        });
    } catch (error) {
        console.log("error---------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.put("/updateById/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id------------------->>", id);
        const userdata = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            date: req.body.date
        };
        console.log("userdata------------>>", userdata);
        const updatedata = await User.findByIdAndUpdate(id, { $set: userdata }, { new: true });
        console.log("updatedata---------------->>", updatedata);
        if (!updatedata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "updatedata sucess",
            result: updatedata
        });
    } catch (error) {
        console.log("error----------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.delete("/deleteById/:id", async (req, res) => {
    try {
        const id = req.params.id;
        console.log("id---------------------->>", id);
        const deletedata = await User.findByIdAndDelete(id);
        console.log("deletedata------------->>", deletedata);
        if (!deletedata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "deletedata sucessfully",
            result: deletedata
        });
    } catch (error) {
        console.log("error------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.post("/searchWithEmail", async (req, res) => {
    try {
        const searchEmail = await User.findOne({ email: req.body.email });
        console.log("searchEmail------------------>>", searchEmail);
        if (!searchEmail) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            result: searchEmail
        });
    } catch (error) {
        console.log("error--------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.post("/searchdata", async (req, res) => {
    try {
        const body = req.body;
        const searchdata = await User.find(body);
        console.log("searchdata--------------->>", searchdata);
        if (!searchdata) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            count: searchdata.length,
            result: searchdata
        });
    } catch (error) {
        console.log("error--------------->>>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
router.post("/searchWithfirstName", async (req, res) => {
    try {
        const searchfirstName = await User.find({ firstName: req.body.firstName });
        console.log("searchfirstName------------------>>", searchfirstName);
        if (!searchfirstName) {
            return res.status(401).json({
                msg: "invalited data find"
            });
        };
        return res.status(200).json({
            msg: "okk sucess",
            count: searchfirstName.length,
            result: searchfirstName
        });
    } catch (error) {
        console.log("error---------------------->>", error);
        res.status(500).json({
            msg: "internal server error",
            error: Error.message
        });
    };
});
module.exports=router