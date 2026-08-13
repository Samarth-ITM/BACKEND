const express = require("express");
const router = express.Router();
const {
    getWelcomeMessage,
    getAllHospitals,
    getAvailableHospitals,
    getHospitalById,
    addHospital,
    updateHospital,
    deleteHospital
} = require("../controllers/hospitalController");

router.get("/", getWelcomeMessage);
router.get("/hospitals", getAllHospitals);
router.get("/hospitals/available", getAvailableHospitals);
router.get("/hospitals/:id", getHospitalById);
router.post("/hospitals", addHospital);
router.put("/hospitals/:id", updateHospital);
router.delete("/hospitals/:id", deleteHospital);

module.exports = router;
