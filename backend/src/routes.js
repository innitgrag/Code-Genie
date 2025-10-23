const express = require("express")
const aiController = require('./controller')

const router = express.Router()

router.post("/review",aiController)

module.exports = router
