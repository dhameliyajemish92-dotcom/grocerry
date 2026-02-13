import Shipments from '../../model/Shipments.js';
import Order from '../../model/Orders.js';
import Pagination from "../../utils/pagination.js";

export const getShipmentId = async (req, res) => {
    const { id } = req.params;
    console.log(`[Shipping] Fetching shipment for order_id: ${id}`);

    try {
        console.log(`[Shipping] About to query Shipments collection...`);
        let your_shipment = await Shipments.findOne({ "order_id": id });
        console.log(`[Shipping] Query completed. Found existing shipment:`, your_shipment ? 'yes' : 'no');

        // If shipment doesn't exist, try to create it from the order
        if (!your_shipment) {
            console.log(`[Shipping] No shipment found, looking for order: ${id}`);
            let order;
            try {
                order = await Order.findOne({ "order_id": id });
                console.log(`[Shipping] Found order:`, order ? 'yes' : 'no');
            } catch (orderError) {
                console.error("[Shipping] Error finding order:", orderError);
                return res.status(400).json({ message: 'Order not found or invalid order ID' });
            }

            if (!order) {
                console.log(`[Shipping] Order not found for: ${id}`);
                return res.status(400).json({ message: 'Invalid order id - no matching order found' });
            }

            // Create shipment from order data
            console.log(`[Shipping] Creating shipment for order: ${id}`);
            const newShipment = new Shipments({
                order_id: order.order_id,
                total: order.total,
                address: order.address,
                phone_number: order.phone_number,
                status: 'CREATED',
                ordered_at: order.ordered_at
            });

            try {
                your_shipment = await newShipment.save();
                console.log(`[Shipping] Auto-created shipment successfully for: ${id}`);
            } catch (saveError) {
                console.error("[Shipping] Error saving shipment:", saveError);
                // If save fails due to duplicate key, try to fetch again
                if (saveError.code === 11000) {
                    console.log(`[Shipping] Duplicate key error, fetching existing shipment for: ${id}`);
                    your_shipment = await Shipments.findOne({ "order_id": id });
                } else {
                    return res.status(400).json({ message: 'Failed to create shipment: ' + saveError.message });
                }
            }
        }

        console.log(`[Shipping] Returning shipment for: ${id}`, your_shipment);
        return res.status(200).json({
            order_id: your_shipment.order_id,
            total: your_shipment.total,
            address: your_shipment.address,
            phone_number: your_shipment.phone_number,
            status: your_shipment.status,
            ordered_at: your_shipment.ordered_at
        });
    } catch (e) {
        console.error("[Shipping] GetShipmentId error:", e);
        return res.status(400).json({ message: e.message });
    }

}


export const updateShipments = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status)
            return res.status(400).json({ message: "Please provide the new status" });

        if (status !== 'CREATED' && status !== 'SHIPPED' && status !== 'DELIVERED' && status !== 'RETURNED')
            return res.status(400).json({ message: "Please re-type the status correctly " });

        const order_id = req.params.id;

        const shipmentResponse = await Shipments.findOneAndUpdate({ order_id }, { status });

        return res.status(200).json(shipmentResponse);
    } catch (e) {
        return res.status(400).json({ message: e.message });
    }
}

export const postShipments = async (req, res) => {
    const { ordered_at, order_id, address, phone_number, total } = req.body;

    const newShippment = new Shipments({
        total: total,
        ordered_at: ordered_at,
        address: address,
        phone_number: phone_number,
        order_id: order_id
    });

    try {
        await newShippment.save();
        res.status(200).json(newShippment);
    } catch (e) {
        res.status(409).json({ message: e.message });
    }
}

export const getShipments = async (req, res) => {
    try {
        const { page } = req.query;

        const shipments = await Shipments.find().sort({ ordered_at: -1 });

        const total_pages = Math.ceil(shipments.length / 20);

        const pagedShipments = Pagination(page, shipments, 20);

        res.status(200).json({ total_pages, shipments: pagedShipments });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}