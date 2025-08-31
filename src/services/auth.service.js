import User from "../models/User.js";
import Role from "../models/Role.js";
import Client from "../models/Client.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config.js";

export const AuthService = {
  validateInput(data, role) {
    const { name, email, password, identification, address, contact } = data;

    if (!name || !email || !password) {
      throw new Error("Nombre, email y contraseña son obligatorios.");
    }

    if (role === "client") {
      if (!identification || !address || !contact) {
        throw new Error(
          "Identificación, dirección y contacto son obligatorios para clientes."
        );
      }
    }
  },

  async registerUser(data, roleName) {
    this.validateInput(data, roleName);

    const { name, email, password, identification, address, contact } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("El correo ya está registrado.");

    const encryptedPassword = await User.encryptPassword(password);
    const role = await Role.findOne({ name: roleName });
    if (!role) throw new Error(`Rol '${roleName}' no encontrado.`);

    const user = new User({
      name,
      email,
      password: encryptedPassword,
      roles: [role._id],
    });

    await user.save();

    if (roleName === "client") {
      const client = new Client({
        userId: user._id,
        identification,
        address,
        contact,
      });
      await client.save();
    }

    return user;
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Email y contraseña son requeridos.");
    }

    const user = await User.findOne({ email }).populate("roles");
    if (!user) throw new Error("Usuario no encontrado.");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Contraseña incorrecta.");

    const roles = user.roles.map((role) => role.name);
    const roleName = roles[0];
    if (!roleName) throw new Error("El usuario no tiene roles asignados.");

    const token = jwt.sign({ id: user._id, roles }, config.SECRET, {
      expiresIn: "24h",
    });

    return {
      token,
      role: roleName,
      name: user.name,
    };
  },
};
