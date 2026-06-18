const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require("./db/db")


const authRoutes = require('./routes/authRoutes')
const appointmentRoutes = require('./routes/appointmentRoutes')
const noteRoutes = require('./routes/noteRoutes')
const errorHandler = require('./middleware/error')

//env config
dotenv.config()

connectDB()

const app = express()
const PORT = process.env.PORT || 5000


//middle ware 
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'https://your-netlify-site.netlify.app',
      'http://localhost:5173'
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json())


//Routes
app.get('/', (req, res) => {
    res.send("Hello welcome to palmcrest ent Hospital")
})

app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/notes', noteRoutes)

// Error handler middleware
app.use(errorHandler)



//server connection 
app.listen(PORT, () => {
    console.log(`server is connected to the port ${PORT}`)
}) 