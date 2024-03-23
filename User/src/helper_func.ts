import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response) {
  const token = req.cookies.token;
  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return false;
  }

  return true;
}
