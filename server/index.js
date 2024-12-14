import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";

//------------------------------------------------------------------------------------------------
//------------------------ Configurations --------------------------------------------------------
//------------------------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url); // grabbing the file url
const __dirname = path.dirname(__filename);

dotenv.config(); // to use .env files

const app = express(); //envoking our express application

app.use(express.json());

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.use(morgan("common"));

app.use(bodyParser.json({ limit: "30mb", extended: true })); //30mb == 30 megabytes
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors()); //envoke our cross origin resource sharing policies

app.use("/assets", express.static(path.join(__dirname, "public/assets"))); // setting the directory for the assets
//------------------------------------------------------------------------------------------------
//------------------------ File Storage ----------------------------------------------------------
//------------------------------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, file.originalname);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });
//------------------------------------------------------------------------------------------------
//------------------------ Routes with Files -----------------------------------------------------
//------------------------ Authentication and Authorization --------------------------------------
//------------------------------------------------------------------------------------------------

//----------route----------middleware function--registering the picture using the auth controller-
app.post("auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
//------------------------------------------------------------------------------------------------
//----------------------------------- Routes -----------------------------------------------------
//------------------------------------------------------------------------------------------------
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
//------------------------------------------------------------------------------------------------
//------------------------ MONGOOSE SETUP --------------------------------------------------------
//------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
