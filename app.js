const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/connectdb');
const UserModel = require('./models/user');
const controller = require('./controllers/UserController');
const userRoutes= require('./routes/userRoutes');
const crypto = require('crypto');
const router = require('./routes/userRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT; // Use uppercase PORT
const DATABASE_URL = process.env.DATABASE_URL;

// cors policy
app.use(cors());

// DATABASE CONNECTIONS
connectDB(DATABASE_URL);

// JSON parsing middleware
app.use(express.json()); // Use lowercase json 

//Load Routesf
app.use("/api/user" , router);

app.listen(port, () => {
    console.log(`server listening at http://localhost:${port}`);
});

