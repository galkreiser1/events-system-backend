import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken } from "./helper_func.js";
import User from "./models/user.js";
import { JWT_SECRET } from "./consts.js";

export async function wakeUpUsersRoute(req: Request, res: Response) {
  console.log("Health check");
  res.status(200).send("Users server is awake");
}

export async function loginRoute(req: Request, res: Response) {
  const credentials = req.body;
  try {
    await User.validate(credentials);
  } catch (e) {
    res.status(400).send("Invalid credentials");
    return;
  }

  let user;

  try {
    user = await User.findOne({ username: credentials.username });
  } catch (e) {
    res.status(500).send("Internal server error");
    return;
  }

  if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
    res.status(401).send("Invalid credentials");
    return;
  }

  const token = jwt.sign({ username: user.username }, JWT_SECRET, {
    expiresIn: "2d",
  });

  const secure = process.env.NODE_ENV
    ? process.env.NODE_ENV === "production"
    : true;

  res.cookie("token", token, { httpOnly: true, secure, sameSite: "none" });

  res.status(200).send("Logged in");
}

export async function logoutRoute(req: Request, res: Response) {
  const secure = process.env.NODE_ENV
    ? process.env.NODE_ENV === "production"
    : true;
  res.clearCookie("token", {
    secure,
    httpOnly: true,
    sameSite: "none",
  });

  res.status(200).send("Logged out");
}

export async function signupRoute(req: Request, res: Response) {
  const user = new User(req.body);
  try {
    const error = await user.validate();
  } catch (e) {
    res.status(400).send("Invalid credentials");
    return;
  }
  if (await User.exists({ username: user.username })) {
    res.status(400).send("Username already exists");
    return;
  }

  user.password = await bcrypt.hash(user.password, 10);

  try {
    await user.save();
  } catch (e) {
    res.status(500).send("Error creating user");
    return;
  }

  res.status(201).send("User created");
}
