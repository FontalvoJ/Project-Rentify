import jwt from "jsonwebtoken";
import config from "../config";
import User from "../models/User";
import Client from "../models/Client";

export const verifyToken = async (req, res, next) => {
  console.log("Headers recibidos:", req.headers);

  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(403)
        .json({ message: "Token no proporcionado o formato inválido" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, config.SECRET);
    } catch (error) {
      console.error("Error al verificar el token:", error.message);
      return res.status(401).json({ message: "Token inválido o expirado" });
    }
    
    req.userId = decoded.id;

    const user = await User.findById(req.userId, { password: 0 }).populate(
      "roles"
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userRoleNames = user.roles.map((role) => role.name);

    if (userRoleNames.includes("client")) {
      const clientInfo = await Client.findOne({ userId: user._id });

      if (!clientInfo) {
        return res
          .status(404)
          .json({ message: "Información del cliente no encontrada" });
      }

      req.client = clientInfo;
    }

    req.user = user;
    req.roles = userRoleNames;

    next();
  } catch (error) {
    console.error("Error en la verificación del token:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const validateRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.roles || !Array.isArray(req.roles)) {
        return res
          .status(403)
          .json({ message: "Información de roles faltante o inválida" });
      }

      const hasAccess = req.roles.some((role) => allowedRoles.includes(role));
      if (hasAccess) {
        return next();
      } else {
        return res
          .status(403)
          .json({ message: "No tienes permisos suficientes" });
      }
    } catch (error) {
      console.error("Error en el middleware validateRoles:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
    }
  };
};

export const authJwt = {
  verifyToken,
  validateRoles,
};
