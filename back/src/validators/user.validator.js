const Joi = require("joi");

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(50).optional().trim(),
  bio: Joi.string().max(200).allow("").optional().trim(),
  website: Joi.string().uri().allow("").optional().trim(),
});

module.exports = {
  updateProfileSchema,
};
