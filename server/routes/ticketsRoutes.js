import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  getTicketStats,
} from "../controllers/ticketsControllers.js";

import express from "express";

const router = express.Router();

router.get("/", getTickets);
router.get("/stats", getTicketStats);
router.get("/:id", getTicketById);
router.post("/", createTicket);
router.put("/:id", updateTicket);

export default router;
