import { Request, Response } from "express";
import { IS_LOCAL } from "./const.js";
import Coupon from "./models/coupon.js";
import axios from "axios";
import UserCoupon from "./models/user_coupons.js";
import { orderPublisher, paymentPublisher, userPublisher } from "./index.js";
import coupon from "./models/coupon.js";

const EVENT_SERVICE = IS_LOCAL
  ? "http://localhost:3001"
  : "https://events-system-event.onrender.com";

export const createCouponRoute = async (req: Request, res: Response) => {
  const { code, discount } = req.body;

  try {
    const newCoupon = new Coupon({ code, discount });

    await newCoupon.save();

    res.status(201).json(newCoupon);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: "Coupon already exists" });
      return;
    }
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCouponRoute = async (req: Request, res: Response) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    res.status(200).json(coupon);
  } catch (error) {
    console.error("Error getting coupon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const compareEvents = (event1, event2) => {
  const eventStartDate = new Date(event1.start_date).getTime();
  const updatedEventStartDate = new Date(event2.start_date).getTime();
  const eventEndDate = new Date(event1.end_date).getTime();
  const updatedEventEndDate = new Date(event2.end_date).getTime();
  return (
    eventStartDate === updatedEventStartDate &&
    eventEndDate === updatedEventEndDate
  );
};

export const buyRoute = async (req: Request, res: Response) => {
  const {
    event,
    ticket_type,
    quantity,
    username,
    payment_details,
    coupon_code,
  } = req.body;
  const eventId = event._id;
  try {
    const response = await axios.get(`${EVENT_SERVICE}/api/event/${eventId}`);
    const updatedEvent = response.data;
    if (!compareEvents(event, updatedEvent)) {
      res.status(409).json({ error: "Event has changed" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: "Interal server error" });
    return;
  }

  // verify payment
  let orderId;
  try {
    // later we will add a payment verification here
    orderId = "65ff1d043097461f92d30968";
  } catch (error) {
    res.status(500).json({ error: "Payment failed" });
    return;
  }

  const order = {
    order_id: orderId,
    checkout_date: new Date(),
    event_id: eventId,
    ticket_type,
    quantity,
    username,
  };

  await orderPublisher.sendEvent(JSON.stringify(order));

  if (coupon_code) {
    const userCoupon = { username, code: coupon_code };
    await paymentPublisher.sendEvent(JSON.stringify(userCoupon));

    await userPublisher.sendEvent(JSON.stringify({ username }));
  }

  res.status(200).json({ order_id: orderId });
};

// export const createUserCouponRoute = async (req: Request, res: Response) => {
//   const { username, code } = req.body;

//   try {
//     const newUserCoupon = new UserCoupon({ username, code });

//     await newUserCoupon.save();

//     res.status(201).json(newUserCoupon);
//   } catch (error) {
//     if (error.code === 11000) {
//       res.status(400).json({ error: "User Coupon Combo already exists" });
//       return;
//     }
//     console.error("Error creating order:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
