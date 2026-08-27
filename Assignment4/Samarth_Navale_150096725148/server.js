require("dotenv").config();

const express = require("express");
const requestLogger = require("./middleware/logger");
const authRouter = require("./routes/authRoutes");
const salonRouter = require("./routes/salonRoutes");
const serviceRouter = require("./routes/serviceRoutes");

const app = express();
const serverPort = process.env.PORT || 4000;

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Salon APIs" });
});

app.use("/", authRouter);
app.use("/salons", salonRouter);
app.use("/services", serviceRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

app.listen(serverPort, () => {
  console.log(`server is running on port ${serverPort}!!`);
});
