
const errorHandler = (err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid data"
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate record"
    });
  }

  console.error(err.message);
  res.status(500).json({
    message: "Internal server error"
  });
};

module.exports = errorHandler;
