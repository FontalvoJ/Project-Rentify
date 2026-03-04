export default class IClientService {
  
  async findByUserId(userId) {
    throw new Error("Method findByUserId() must be implemented");
  }

  async update(client, updates) {
    throw new Error("Method update() must be implemented");
  }

  async deleteByUserId(userId) {
    throw new Error("Method deleteByUserId() must be implemented");
  }
}
