const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const User = require('../models/User');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', async (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    // TODO: autenticar a la usuarix
    try {
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        return next(404)
      }

      const matches = await bcrypt.compare(password, user.password);
      if (!matches) {
        // si no coincide, no autorizado
        return next(404)
      }
      // en mongo se crea una _id automáticamente
      return resp.json({
        token: jwt.sign({ uid: user._id }, secret),
        id: user._id,
        email: email
      });
    } catch (err) { console.log('Error:', err) }
    // next();
  });

  return nextMain();
};
