require("dotenv").config()
const express = require("express")
const aiRoutes = require("./src/routes")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cors())

app.use("/ai",aiRoutes)

app.listen(4000,()=>{console.log("Server is Listening")})