const Joi = require("joi");

const createShortSchema = Joi.object({
  title: Joi.string().max(150).required().trim(),
  description: Joi.string().max(1000).allow("").optional().trim(),
  soundId: Joi.string().hex().length(24).optional().allow(null, ""),
  privacy: Joi.string().valid("public", "private", "unlisted").optional(),
});

const updateShortSchema = Joi.object({
  title: Joi.string().max(150).optional().trim(),
  description: Joi.string().max(1000).allow("").optional().trim(),
  privacy: Joi.string().valid("public", "private", "unlisted").optional(),
});

module.exports = {
  createShortSchema,
  updateShortSchema,
};
