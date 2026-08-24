const Joi = require("joi");

const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(500).required().trim(),
  parentCommentId: Joi.string().hex().length(24).optional().allow(null, ""),
});

module.exports = {
  addCommentSchema,
};
