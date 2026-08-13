const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");

const getWelcomeMessage = (req, res) => {
    res.json({
        message: "Welcome to Hospital API"
    });
};

const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find();
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getAvailableHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({ availableBeds: { $gt: 0 } });
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Hospital ID"
            });
        }

        const hospital = await Hospital.findById(id);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital Not Found"
            });
        }

        res.json(hospital);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const addHospital = async (req, res) => {
    try {
        const { name, city, totalBeds, availableBeds } = req.body;

        if (!name || !city || totalBeds === undefined || availableBeds === undefined) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const hospital = new Hospital({
            name,
            city,
            totalBeds,
            availableBeds
        });

        await hospital.save();

        res.status(201).json({
            message: "Hospital Added Successfully",
            hospital
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateHospital = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Hospital ID"
            });
        }

        const { name, city, totalBeds, availableBeds } = req.body;

        const hospital = await Hospital.findById(id);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital Not Found"
            });
        }

        if (name !== undefined) hospital.name = name;
        if (city !== undefined) hospital.city = city;
        if (totalBeds !== undefined) hospital.totalBeds = totalBeds;
        if (availableBeds !== undefined) hospital.availableBeds = availableBeds;

        await hospital.save();

        res.json({
            message: "Hospital Updated Successfully",
            hospital
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Hospital ID"
            });
        }

        const hospital = await Hospital.findByIdAndDelete(id);

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital Not Found"
            });
        }

        res.json({
            message: "Hospital Deleted Successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getWelcomeMessage,
    getAllHospitals,
    getAvailableHospitals,
    getHospitalById,
    addHospital,
    updateHospital,
    deleteHospital
};
