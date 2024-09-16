const Joi = require("joi");

exports.validateUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(user);
};

exports.validatePassword = (passwords) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  });

  return schema.validate(passwords);
};
