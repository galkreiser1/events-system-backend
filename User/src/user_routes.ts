import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken, getUserFromCookie } from "./helper_func.js";
import User from "./models/user.js";
import { get } from "http";
import axios from "axios";
import { ORDERS_SERVER_URL, IS_LOCAL } from "./consts.js";
import { config } from "./config.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const ORDERS_SERVICE_URL = IS_LOCAL
  ? "http://localhost:3002"
  : ORDERS_SERVER_URL;

export async function getNextEventRoute(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send("Not logged in");
    return;
  }

  let username;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    username = (payload as JwtPayload).username;
  } catch (e) {
    res.status(401).send("Invalid token");
    return;
  }

  let user;
  try {
    user = await User.findOne({ username });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  if (user.next_event && user.next_event.title && user.next_event.start_date) {
    if (new Date(user.next_event.start_date) < new Date()) {
      const response = await axios.get(
        `${ORDERS_SERVICE_URL}/api/order/nextevent/${username}`,
        config.API_KEY_HEADER
      );
      const title = response.data.title;
      const start_data = response.data.start_date;
      user.next_event = { title: title, start_date: start_data };
      await user.save();
    }
  }

  res.status(200).send({ next_event: user.next_event });
}

export async function updateNextEventRoute(req: Request, res: Response) {
  const username = req.body.username;
  let user;
  try {
    user = await User.findOne({ username });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  user.next_event = req.body.next_event;
  try {
    await user.save();
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  res.status(200).send({ next_event: user.next_event });
}

export async function getNumofCouponsRoute(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send("Not logged in");
    return;
  }

  let username;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    username = (payload as JwtPayload).username;
  } catch (e) {
    res.status(401).send("Invalid token");
    return;
  }

  let user;
  try {
    user = await User.findOne({ username });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  res.status(200).send({ coupons_used: user.coupons_used });
}

export async function updateNumofCouponsRoute(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send("Not logged in");
    return;
  }

  let username;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    username = (payload as JwtPayload).username;
  } catch (e) {
    res.status(401).send("Invalid token");
    return;
  }

  let user;
  try {
    user = await User.findOne({ username });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  user.coupons_used += 1;
  try {
    await user.save();
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  res.status(200).send({ coupons_used: user.coupons_used });
}

export async function getUserRoute(req: Request, res: Response) {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  const token = req.cookies.token;
  let username;
  const payload = jwt.verify(token, JWT_SECRET);
  username = (payload as JwtPayload).username;
  let user;
  try {
    user = await User.findOne({ username });
    const { permission } = user;
    res.status(200).send({ username: username, permission: permission });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }
}

export async function updateUserPermissionRoute(req: Request, res: Response) {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  try {
    const user = await getUserFromCookie(req);

    if (user.permission !== "A") {
      res.status(403).send("Permission denied");
      return;
    }
    let targetUser = req.body.username;
    const newPermission = req.body.permission;

    if (!targetUser || !newPermission) {
      res.status(400).send("Missing fields");
      return;
    }

    if (
      newPermission !== "U" &&
      newPermission !== "A" &&
      newPermission !== "M" &&
      newPermission !== "W"
    ) {
      res.status(400).send("Invalid permission");
      return;
    }

    targetUser = await User.findOne({ username: targetUser });
    if (!targetUser) {
      res.status(404).send("User not found");
      return;
    }
    targetUser.permission = newPermission;
    await targetUser.save();
    res.status(200).send({
      username: targetUser.username,
      permission: targetUser.permission,
    });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }
}
