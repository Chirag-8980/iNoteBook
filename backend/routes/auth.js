const express = require("express");
const router = express.Router();
const User = require("../models/User")
const bcryptjs = require('bcryptjs')
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');

const JWT_SECRET = "ChikuBhaiIsG@@DBOY"
// Create A User Using : POST : "/api/auth/createuser" No Login Required...
router.post("/createuser", [
    body('email', "Enter A Valid Email").isEmail({ min: 3 }),
    body('password', "Enter A Valid Password").isLength({ min: 5 }),
    body('name', "Enter A Valid Name").isLength(),
], async (req, res) => {
    // If error than return Bad req. and err ...!
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check User Is Exists Or Not 
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "This User Is Already Exists...!" })
        }
        // Create a New User
        const salt = await bcryptjs.genSalt(10);
        const secPass = await bcryptjs.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authTocken = jwt.sign(data, JWT_SECRET);
        res.json({ authTocken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Some Error')
    }
})

// Create A User Using : POST : "/api/auth/login" No Login Required...
router.post("/login", [
    body('email', "Enter A Valid Email").isEmail({ min: 3 }),
    body('password', "Password must add").exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Error Please Again..!" })
        }
        const passwordCompare = await bcryptjs.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ error: "Error Please Again..!" })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authTocken = jwt.sign(data, JWT_SECRET);
        res.json({ authTocken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server Errror..!')
    }
})
module.exports = router
