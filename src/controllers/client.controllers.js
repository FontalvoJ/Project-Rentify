import Client from "../models/Client.js";
import User from "../models/User.js";

export const getClientInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const client = await Client.findOne({ userId }).populate("userId");
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    return res.status(200).json({
      message: "Client information retrieved successfully",
      client,
    });
  } catch (error) {
    console.error("Error retrieving client information:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateClientAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, identification, address, contact, email, password } =
      req.body;

    const client = await Client.findOne({ userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (identification) client.identification = identification;
    if (address) client.address = address;
    if (contact) client.contact = contact;
    await client.save();

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      user.password = await User.encryptPassword(password);
    }
    await user.save();

    return res.status(200).json({
      message: "Cuenta actualizada correctamente",
      client,
      user,
    });
  } catch (error) {
    console.error("Error al actualizar la cuenta del cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const deleteClientAccount = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar cliente por userId
    const client = await Client.findOne({ userId });
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await Client.deleteOne({ userId });

    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la cuenta del cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export default {
  getClientInfo,
  updateClientAccount,
  deleteClientAccount,
};
