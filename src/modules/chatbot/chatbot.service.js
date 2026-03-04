import { handleMessage } from "../chatbot/chatbot.state";

export class ChatbotService {
  processMessage(userId, message) {
    return handleMessage(userId, message);
  }
}
