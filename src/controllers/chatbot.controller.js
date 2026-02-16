export default class ChatbotController {
  constructor(chatbotService) {
    this.chatbotService = chatbotService;
  }

  chat = (req, res) => {
    const { userId, message } = req.body;
    const response = this.chatbotService.processMessage(userId, message);
    res.json({ response });
  };
}
