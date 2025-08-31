import {
  findClientByUserId,
  updateClient,
  deleteClientByUserId,
} from "../services/client.service.js";

import {
  findUserById,
  updateUser,
  deleteUserById,
} from "../services/user.service.js";

// Obtener información del cliente
export const getClientInfo = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar cliente
    const client = await findClientByUserId(userId);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Buscar usuario asociado
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Combinar datos en la respuesta
    return res.status(200).json({
      message: "Información del cliente obtenida correctamente",
      client: {
        identification: client.identification,
        address: client.address,
        contact: client.contact,
      },
      user: {
        name: user.name,
        email: user.email,
        // ❌ Nunca devolver password en una API de este tipo
        // password: user.password,  <-- ¡NO recomendado!
      },
    });
  } catch (error) {
    console.error("Error al obtener la información del cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar datos del cliente y usuario
export const updateClientAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, identification, address, contact, email, password } =
      req.body;

    const client = await findClientByUserId(userId);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const updatedClient = await updateClient(client, {
      identification,
      address,
      contact,
    });
    const updatedUser = await updateUser(user, { name, email, password });

    return res.status(200).json({
      message: "Cuenta actualizada correctamente",
      client: updatedClient,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar la cuenta del cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar cuenta de cliente y usuario
export const deleteClientAccount = async (req, res) => {
  try {
    const userId = req.userId;

    const client = await findClientByUserId(userId);
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    await deleteClientByUserId(userId);
    await deleteUserById(userId);

    return res.status(200).json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la cuenta del cliente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
