import { Router } from "express";
import ChatbotController from "../chatbot/chatbot.controller.js";
import { ChatbotService } from "../chatbot/chatbot.service.js";

const router = Router();

const chatbotService = new ChatbotService();
const chatbotController = new ChatbotController(chatbotService);

router.post("/", chatbotController.chat);

export default router;
