import Shipments from '../../model/Shipments.js';
import Pagination from "../../utils/pagination.js";
import axios from "axios";
import { USER_BASEURL } from "../../services/BaseURLs.js";

export const getShipmentId = async (req, res) => {
  const { id } = req.params;

  try {
    const your_shipment = await Shipments.findOne({ orderId: id });

    if (!your_shipment)
      return res.status(400).json({ message: 'Invalid order id' });

    return res.status(200).json({
      orderId: your_shipment.orderId,
      total: your_shipment.total,
      address: your_shipment.address,
      status: your_shipment.status,
      ordered_at: your_shipment.ordered_at
    });

  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

export const updateShipments = async (req, res) => {
  try {

    const { status } = req.body;

    try {
      await axios.post(`${USER_BASEURL}/role`, { id: req.body.id, role: 'ADMIN' })
    } catch (e) {
      return res.status(e.response.status).json(e.response.data);
    }

    if (!status)
      return res.status(400).json({ message: "Please provide new status" });

    const orderId = req.params.id;

    const shipmentResponse = await Shipments.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );

    return res.status(200).json(shipmentResponse);

  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

export const postShipments = async (req, res) => {

  const { ordered_at, orderId, address, total } = req.body;

  const newShipment = new Shipments({
    total,
    ordered_at,
    address,
    orderId
  });

  try {
    await newShipment.save();
    res.status(200).json(newShipment);
  } catch (e) {
    res.status(409).json({ message: e.message });
  }
};

export const getShipments = async (req, res) => {
  try {

    try {
      await axios.post(`${USER_BASEURL}/role`, { id: req.body.id, role: 'ADMIN' })
    } catch (e) {
      return res.status(e.response.status).json(e.response.data);
    }

    const { page } = req.query;

    const shipments = await Shipments.find().sort({ ordered_at: -1 });

    const total_pages = Math.ceil(shipments.length / 20);
    const pagedShipments = Pagination(page, shipments, 20);

    res.status(200).json({ total_pages, shipments: pagedShipments });

  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
