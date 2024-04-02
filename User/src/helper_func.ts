import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "./models/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function verifyToken(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return false;
  }

  return true;
}

export function getUsernameFromCookie(req: Request) {
  const token = req.cookies.token;
  let username;
  const payload = jwt.verify(token, JWT_SECRET);
  username = (payload as JwtPayload).username;
  return username;
}

export async function getUserFromCookie(req: Request) {
  let username = getUsernameFromCookie(req);
  const user = await User.findOne({ username });
  return user;
}