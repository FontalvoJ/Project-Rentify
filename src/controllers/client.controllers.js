import { toClientUpdateDto } from "../dtos/client.dto.js";

export default class ClientController {
  constructor(clientService, userService) {
    this.clientService = clientService;
    this.userService = userService;
  }

  // Obtener información del cliente
  getClientInfo = async (req, res) => {
    try {
      const userId = req.userId;

      const client = await this.clientService.findClientByUserId(userId);
      if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }

      const user = await this.userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      return res.status(200).json({
        message: "Información del cliente obtenida correctamente",
        data: {
          client: {
            identification: client.identification,
            address: client.address,
            contact: client.contact,
            phone: client.phone,
          },
          user: {
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error("Error al obtener la información del cliente:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  // Actualizar datos del cliente y usuario
  updateClientAccount = async (req, res) => {
    try {
      const userId = req.userId;
      const { name, email, password } = req.body;

      const client = await this.clientService.findClientByUserId(userId);
      if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }

      const user = await this.userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // DTO para sanitizar datos
      const clientUpdates = toClientUpdateDto(req.body);

      const updatedClient = await this.clientService.updateClient(
        client,
        clientUpdates
      );
      const updatedUser = await this.userService.updateUser(user, {
        name,
        email,
        password,
      });

      return res.status(200).json({
        message: "Cuenta actualizada correctamente",
        data: {
          client: updatedClient,
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error("Error al actualizar la cuenta del cliente:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };

  // Eliminar cuenta de cliente y usuario
  deleteClientAccount = async (req, res) => {
    try {
      const userId = req.userId;

      const client = await this.clientService.findClientByUserId(userId);
      if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }

      await this.clientService.deleteClientByUserId(userId);
      await this.userService.deleteUserById(userId);

      return res.status(200).json({

        message: "Cuenta eliminada correctamente",
      });
    } catch (error) {
      console.error("Error al eliminar la cuenta del cliente:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };
}
