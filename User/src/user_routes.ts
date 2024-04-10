import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyToken, getUserFromCookie } from "./helper_func.js";
import User from "./models/user.js";
import { get } from "http";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

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

  res.status(200).send("Logged out. Cleared cookie.");
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

//TODO: implement acreasement of coupons by one

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

//TODO: change the permission of the user
// think what to do if the user has other permissions other than U

// export async function usernameRoute(req: Request, res: Response) {
//   const token = req.cookies.token;
//   if (!token) {
//     res.status(401).send("Not logged in");
//     return;
//   }

//   let username;
//   try {
//     const payload = jwt.verify(token, JWT_SECRET);
//     username = (payload as JwtPayload).username;
//   } catch (e) {
//     res.status(401).send("Invalid token");
//     return;
//   }

//   res.status(200).send({ username });
// }
