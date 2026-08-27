const {
  fetchServicesBySalon,
  fetchAvailableServices,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
} = require("../models/Services");
const { fetchSalonById } = require("../models/Salons");

async function listServicesBySalon(req, res) {
  try {
    const salonRecord = await fetchSalonById(req.params.id);
    if (!salonRecord) {
      return res.status(404).json({ message: "Salon not found" });
    }

    const serviceList = await fetchServicesBySalon(req.params.id);
    return res.status(200).json(serviceList);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function listAvailableServices(req, res) {
  try {
    const availableServices = await fetchAvailableServices();
    return res.status(200).json(availableServices);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function addNewService(req, res) {
  try {
    const { serviceName, price, duration, isAvailable } = req.body;

    if (!serviceName || price === undefined) {
      return res
        .status(400)
        .json({ message: "serviceName and price are required" });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return res
        .status(400)
        .json({ message: "price must be a positive number" });
    }

    const salonRecord = await fetchSalonById(req.params.id);
    if (!salonRecord) {
      return res.status(404).json({ message: "Salon not found" });
    }

    const createdService = await createServiceRecord(req.params.id, {
      serviceName,
      price,
      duration,
      isAvailable: isAvailable === undefined ? true : isAvailable,
    });

    return res
      .status(201)
      .json({ message: "Service created", service: createdService });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function modifyService(req, res) {
  try {
    const { serviceName, price, duration, isAvailable } = req.body;
    const updatePayload = {};

    if (serviceName !== undefined) updatePayload.service_name = serviceName;
    if (price !== undefined) updatePayload.price = price;
    if (duration !== undefined) updatePayload.duration = duration;
    if (isAvailable !== undefined) updatePayload.is_available = isAvailable;

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedService = await updateServiceRecord(
      req.params.id,
      updatePayload
    );
    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res
      .status(200)
      .json({ message: "Service updated", service: updatedService });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

async function removeService(req, res) {
  try {
    const deletedService = await deleteServiceRecord(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }
    return res
      .status(200)
      .json({ message: "Service deleted", service: deletedService });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listServicesBySalon,
  listAvailableServices,
  addNewService,
  modifyService,
  removeService,
};
