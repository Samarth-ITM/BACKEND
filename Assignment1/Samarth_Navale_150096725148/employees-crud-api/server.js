require("dotenv").config();

const express = require("express");
const employeeRouter = require("./router/employeerouter");
const db = require("./config/db");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/employee", employeeRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
