const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message.replace(/"/g, ""));
      return next(new ApiError(400, "Validation Error", errorMessages));
    }
    req.body = value;
    next();
  };
};

module.exports = validate;
