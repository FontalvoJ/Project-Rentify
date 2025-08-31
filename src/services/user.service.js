import User from "../models/User.js";

export const findUserById = (userId) => User.findById(userId);

export const updateUser = async (user, updates) => {
  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email;
  if (updates.password) {
    user.password = await User.encryptPassword(updates.password);
  }
  return await user.save();
};

export const deleteUserById = (userId) => User.findByIdAndDelete(userId);
