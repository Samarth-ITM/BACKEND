const express = require("express");
const verifyAuthToken = require("../middleware/auth");
const {
  listAllSalons,
  listTopSalons,
  listSalonsByCity,
  getSalonDetails,
  addNewSalon,
  modifySalon,
  removeSalon,
} = require("../controllers/salonController");
const {
  listServicesBySalon,
  addNewService,
} = require("../controllers/serviceController");

const salonRouter = express.Router();

salonRouter.get("/top", listTopSalons);
salonRouter.get("/city/:city", listSalonsByCity);
salonRouter.get("/", listAllSalons);
salonRouter.get("/:id", getSalonDetails);
salonRouter.post("/", verifyAuthToken, addNewSalon);
salonRouter.put("/:id", verifyAuthToken, modifySalon);
salonRouter.delete("/:id", verifyAuthToken, removeSalon);

salonRouter.get("/:id/services", listServicesBySalon);
salonRouter.post("/:id/services", verifyAuthToken, addNewService);

module.exports = salonRouter;
