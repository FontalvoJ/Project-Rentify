export const validateDto = (DtoClass) => (req, res, next) => {
  try {
    req.validated = new DtoClass(req.body); 
    next();
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
