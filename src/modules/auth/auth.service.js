import { IAuthService } from "../auth/IAuthService.js";
import User from "../../models/User.js";
import Role from "../../models/Role.js";
import Client from "../../models/Client.js";
import jwt from "jsonwebtoken";
import config from "../../config.js";
import { AuthResponseDTO } from "../auth/authResponse.js";

export class AuthServiceMongoose extends IAuthService {
  async registerUser(userData, roleName) {
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new Error(`El rol "${roleName}" no existe en la BD`);
    }

    const hashedPassword = await User.encryptPassword(userData.password);
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      roles: [role._id],
    });

    const savedUser = await newUser.save();
    await savedUser.populate("roles", "name");

    if (roleName === "client") {
      await Client.create({
        identification: userData.identification,
        address: userData.address,
        contact: userData.contact,
        userId: savedUser._id,
      });
    }

    const token = jwt.sign({ id: savedUser._id }, config.SECRET, {
      expiresIn: "1d",
    });

    return new AuthResponseDTO({
      token,
      role: savedUser.roles[0].name,
      name: savedUser.name,
    });
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).populate("roles", "name");
    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Credenciales inválidas");
    }

    const token = jwt.sign({ id: user._id }, config.SECRET, {
      expiresIn: "24h",
    });

    return new AuthResponseDTO({
      token,
      role: user.roles[0].name,
      name: user.name,
    });
  }
}
