import dotenv from "dotenv";
import express from 'express';
import path from "path";
import { connectDB } from "./config/db.js";
import playerRoutes from "./routes/player.route.js";
import paddleRoutes from "./routes/paddle.route.js";
import cors from 'cors';

dotenv.config({ path: path.resolve('./backend/.env') });



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); //allows us to accept JSON data in the req.body

app.use("/api/players", playerRoutes)
app.use("/api/paddles", paddleRoutes)


app.listen(PORT,() =>{
    connectDB();
    console.log('Server started at http://localhost:' + PORT);
});
