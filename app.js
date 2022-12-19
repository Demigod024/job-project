const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
dotenv.config({ path: "./secret.env" });
const UserRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const jobRoute = require("./routes/jobRoute");
const userJobRoute = require("./routes/userJobRoute");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
app.use(express.json());

app.use(cookieParser());


var accessLogStream = fs.createWriteStream(
    path.join("./utils", "event.log"),
    {
        flags: "a",
    }
);
app.use(express.json());
app.use(cors())

app.use(morgan("dev", { stream: accessLogStream }));

app.use("/api/v1/auths", authRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/jobs", jobRoute);
app.use("/api/v1/userjobs", userJobRoute);




const db = () => {
    mongoose.connect(process.env.DB_URL);
};
db()
mongoose.connection.once("open", () => {
    console.log("Connected To Database!");
});



app.listen(process.env.
    PORT || 3400, () => {
        console.log(`server running`);
    });

