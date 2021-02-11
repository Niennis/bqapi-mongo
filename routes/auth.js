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
    });
    
    /*if (email === adminEmail && password === adminPassword) {
      // var token = jwt.sign({ foo: 'bar' }, secret);
      // sign es para firmar, ¿qué se firma? al usuario
      // secret es la llave de encriptación
      // console.log(token);
      return resp.json({
        token: jwt.sign({ uid: 'admin' }, secret),
      });
    }*/

    // resp.json({ email, password })
    // next();
    // return next(401);
  });

  return nextMain();
};
