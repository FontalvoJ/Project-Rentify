export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  console.error("🔥 Error:", {
    message: err.message,
    name: err.name,
    stack: err.stack,
  });

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expirado",
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Token inválido",
    });
  }

  if (err.message === "Credenciales inválidas") {
    return res.status(401).json({
      message: err.message,
    });
  }

  if (
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("ECONNREFUSED"))
  ) {
    return res.status(503).json({
      message: "Servicio temporalmente no disponible",
    });
  }

  return res.status(500).json({
    message: "Error interno del servidor",
    ...(isDev && { debug: err.message }),
  });
};
