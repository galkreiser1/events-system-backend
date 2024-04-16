import { Request, Response } from "express";
import axios from "axios";
import { verifyToken } from "./helper_func.js";
import { COMMENTS_SERVER_URL } from "./consts.js";
import { config } from "./config.js";

export const createCommentRoute = async (req: Request, res: Response) => {
  if (!verifyToken(req, res)) {
    res.status(401).send("Not logged in");
    return;
  }

  try {
    const commentData = req.body;
    const response = await axios.post(
      COMMENTS_SERVER_URL + "/api/comment",
      commentData,
      config.API_KEY_HEADER
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

  if (!req.params.eventId || !req.params.page) {
    res.status(400).send("Invalid parameters");
    return;
  }
  const pageNumber = parseInt(req.params.page);
  const eventId = req.params.eventId;

  try {
    const response = await axios.get(
      COMMENTS_SERVER_URL + `/api/comment/${eventId}/${pageNumber}`,
      config.API_KEY_HEADER
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

  const eventId = req.params.eventId;

  try {
    const response = await axios.get(
      COMMENTS_SERVER_URL + `/api/comment/${eventId}/num`,
      config.API_KEY_HEADER
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
