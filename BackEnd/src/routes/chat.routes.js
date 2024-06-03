import { Router } from "express";

import { createChat, currentChats } from "../controllers/chat.controller.js";

const router = Router();

router.route("/create-chat").post(createChat);
router.route("/current-chats").get(currentChats);

export default router;
