export const errorHandler = (err, req, res, next) => {
  console.error(err); // solo en backend

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
