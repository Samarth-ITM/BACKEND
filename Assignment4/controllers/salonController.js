const {
  fetchSalons,
  fetchSalonById,
  fetchSalonsByCity,
  fetchTopRatedSalons,
  createSalonRecord,
  updateSalonRecord,
  deleteSalonRecord,
} = require("../models/Salons");

async function listAllSalons(req, res) {
  try {
    const salonList = await fetchSalons();
    return res.status(200).json(salonList);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function listTopSalons(req, res) {
  try {
    const topSalons = await fetchTopRatedSalons(5);
    return res.status(200).json(topSalons);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function listSalonsByCity(req, res) {
  try {
    const citySalons = await fetchSalonsByCity(req.params.city);
    return res.status(200).json(citySalons);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function getSalonDetails(req, res) {
  try {
    const salonItem = await fetchSalonById(req.params.id);
    if (!salonItem) {
      return res.status(404).json({ message: "Salon not found" });
    }
    return res.status(200).json(salonItem);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function addNewSalon(req, res) {
  try {
    const { name, city, address, rating } = req.body;

    if (!name || !city) {
      return res
        .status(400)
        .json({ message: "name and city are required" });
    }

    const createdSalon = await createSalonRecord({
      name,
      city,
      address,
      rating,
    });
    return res
      .status(201)
      .json({ message: "Salon created", salon: createdSalon });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function modifySalon(req, res) {
  try {
    const { name, city, address, rating } = req.body;
    const updatePayload = {};

    if (name !== undefined) updatePayload.name = name;
    if (city !== undefined) updatePayload.city = city;
    if (address !== undefined) updatePayload.address = address;
    if (rating !== undefined) updatePayload.rating = rating;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedSalon = await updateSalonRecord(req.params.id, updatePayload);
    if (!updatedSalon) {
      return res.status(404).json({ message: "Salon not found" });
    }

    return res
      .status(200)
      .json({ message: "Salon updated", salon: updatedSalon });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function removeSalon(req, res) {
  try {
    const deletedSalon = await deleteSalonRecord(req.params.id);
    if (!deletedSalon) {
      return res.status(404).json({ message: "Salon not found" });
    }
    return res
      .status(200)
      .json({ message: "Salon deleted", salon: deletedSalon });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listAllSalons,
  listTopSalons,
  listSalonsByCity,
  getSalonDetails,
  addNewSalon,
  modifySalon,
  removeSalon,
};
