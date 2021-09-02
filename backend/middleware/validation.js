const { Joi } = require('express-validation');

const registerValidation = {
    body: Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    })
};

const loginValidation = {
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required()
    })
};

module.exports = { registerValidation, loginValidation };