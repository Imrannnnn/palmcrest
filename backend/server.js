const express = require('express')
const dotenv = require('dotenv')
const connectDB = require("./db/db")


//env config
dotenv.config()

connectDB()

const app = express()
const PORT = 5000


//middle ware 
app.use(express.json())


//Route
app.get('/', (req, res) => {
    res.send("Hello welcome to palmcrest ent Hospital")
})



//server connection 
app.listen(PORT, () => {
    console.log(`server is connected to the port ${PORT}`)
}) 