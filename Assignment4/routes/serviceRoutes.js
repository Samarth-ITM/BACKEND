const express = require("express");
const verifyAuthToken = require("../middleware/auth");
const {
  listAvailableServices,
  modifyService,
  removeService,
} = require("../controllers/serviceController");

const serviceRouter = express.Router();

serviceRouter.get("/available", listAvailableServices);
serviceRouter.put("/:id", verifyAuthToken, modifyService);
serviceRouter.delete("/:id", verifyAuthToken, removeService);

module.exports = serviceRouter;
