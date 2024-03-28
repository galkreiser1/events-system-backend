import { Request, Response } from "express";
import jwt from "jsonwebtoken";

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
