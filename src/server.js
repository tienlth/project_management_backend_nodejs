const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { initSocket } = require("./config/socket");
const routes = require("./routes");
const { startReminderCronJob } = require("./config/cronjob");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors());
app.use(express.json());

app.use("/api", routes);

mongoose.connect(process.env.DB_URL)
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

startReminderCronJob();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
