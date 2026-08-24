const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().trim(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).max(50).required().trim(),
});

const loginSchema = Joi.object({
  emailOrUsername: Joi.string().required().trim(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
