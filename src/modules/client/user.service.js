import User from "../../models/User.js";
import IUserService from "./IUserService.js";

export default class UserServiceMongoose extends IUserService {
  async findUserById(userId) {
    return await User.findById(userId);
  }

  async updateUser(user, updates) {
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.password) {
      user.password = await User.encryptPassword(updates.password);
    }
    return await user.save();
  }

  async deleteUserById(userId) {
    return await User.findByIdAndDelete(userId);
  }
}
