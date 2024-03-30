import { Request, Response } from "express";
import Comment from "./models/comment.js";
import axios from "axios";

//TODO: errors
//TODO: security?
export async function createCommentRoute(req: Request, res: Response) {
  try {
    const newComment = new Comment(req.body);

    try {
      const error = await newComment.validate();
    } catch (e) {
      res.status(400).send("Invalid comment. you sent: " + req.body);
      return;
    }

    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "server - Internal server error" });
  }
}

export async function getCommentsByEventRoute(req: Request, res: Response) {
  const { eventId, page } = req.params;

  // if (!eventId || !page) {
  //     res.status(400).send("Invalid parameters");
  //     return;
  // }
  const pageNumber = parseInt(page);
  const limit = 5;

  try {
    const comments = await Comment.find({ eventId })
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    res.status(200).send(comments);
  } catch (e) {
    res.status(500).send("Internal server error");
  }
}

export async function getNumOfCommentsByEventRoute(
  req: Request,
  res: Response
) {
  const { eventId } = req.params;

  //   if (!eventId) {
  //     res.status(400).send("Missing required fields");
  //     return;
  //   }

  try {
    const count = await Comment.countDocuments({ eventId: eventId });
    res.status(200).send(count.toString());
  } catch (e) {
    res.status(500).send("Internal server error");
  }
}
