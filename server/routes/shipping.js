import express from "express";
import {postShipments, updateShipments, getShipmentId, getShipments} from "../controller/shipping/Shipping.js";
import auth from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";


const router = express.Router();
router.post('/', postShipments);
router.get('/:id', getShipmentId);
router.get('/', adminAuth, getShipments);
router.patch('/:id', adminAuth, updateShipments);


export default router;