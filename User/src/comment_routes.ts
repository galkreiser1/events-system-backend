import { Request, Response } from "express";
import axios from "axios";
import { verifyToken } from "./helper_func.js";
import { COMMENTS_SERVER_URL } from "./consts.js";

export const createCommentRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }

  // TODO: should be here or on the routes?
  // validate request body:
  // if (!req.body.eventId || !req.body.comment || !req.body.date) {
  //     res.status(400).send("Invalid parameters");
  //     return;
  // }

  try {
    const commentData = req.body;
    const response = await axios.post(
      COMMENTS_SERVER_URL + "/api/comment",
      commentData
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "API Gateaway - Internal server error" });
  }
};

export const getCommentsByEventRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  // TODO: should be here or on the routes?
  // validate request body:
  if (!req.params.eventId || !req.params.page) {
    res.status(400).send("Invalid parameters");
    return;
  }
  const pageNumber = parseInt(req.params.page);
  const eventId = req.params.eventId;

  try {
    const response = await axios.get(
      COMMENTS_SERVER_URL + `/api/comment/${eventId}/${pageNumber}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNumOfCommentsByEventRoute = async (
  req: Request,
  res: Response
) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }
  // TODO: should be here or on the routes?
  // validate request body:
  //   if (!req.params.eventId) {
  //     res.status(400).send("Invalid parameters");
  //     return;
  //   }

  const eventId = req.params.eventId;

  try {
    const response = await axios.get(
      COMMENTS_SERVER_URL + `/api/comment/${eventId}/num`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
