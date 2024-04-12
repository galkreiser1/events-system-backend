import { Request, Response } from "express";
import axios from "axios";
import { verifyToken, getUserFromCookie } from "./helper_func.js";
import { PAYMENT_SERVER_URL, IS_LOCAL } from "./consts.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./consts.js";
import { config } from "./config.js";

const SERVER_URL = IS_LOCAL ? "http://localhost:3003" : PAYMENT_SERVER_URL;

export const getCouponRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const code = req.params.code;
    const response = await axios.get(
      `${SERVER_URL}/api/payment/coupon/${code}`,
      config.API_KEY_HEADER
    );
    res.json(response.data);
  } catch (error) {
    if (error.response.status === 404) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createCouponRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }

  try {
    const user = await getUserFromCookie(req);

    if (user.permission !== "A" && user.permission !== "M") {
      res.status(403).send("Permission denied");
      return;
    }
    const { code, discount } = req.body;

    const response = await axios.post(
      `${SERVER_URL}/api/payment/coupon`,
      {
        code,
        discount,
      },
      config.API_KEY_HEADER
    );

    res.status(201).json(response.data);
  } catch (error) {
    if (error.response.status === 400) {
      res.status(400).json({ error: "Coupon already exists" });
      return;
    }
    console.error("Error creating coupon:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const buyRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }

  const token = req.cookies.token;
  let username;
  const payload = jwt.verify(token, JWT_SECRET);
  username = (payload as JwtPayload).username;
  const { event, ticket_type, quantity, payment_details, coupon_code } =
    req.body;

  try {
    const response = await axios.post(
      `${SERVER_URL}/api/payment/buy`,
      {
        event,
        ticket_type,
        quantity,
        username,
        payment_details,
        coupon_code,
      },
      config.API_KEY_HEADER
    );

    res.status(201).json(response.data);
  } catch (error) {
    if (error.response.status === 409) {
      res.status(409).json({ error: "Event has changed" });
      return;
    }
    console.error("Error buying ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
