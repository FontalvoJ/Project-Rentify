import Client from "../models/Client.js";
import IClientService from "../interfaces/IClientService.js";

export default class ClientServiceMongoose extends IClientService {
  async findClientByUserId(userId) {
    return await Client.findOne({ userId });
  }

  async updateClient(client, updates) {
    Object.assign(client, updates);
    return await client.save();
  }

  async deleteClientByUserId(userId) {
    return await Client.deleteOne({ userId });
  }
}
