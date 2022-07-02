const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth')
const { getIdOrEmail, pagination } = require('../utils');

module.exports = {
  // GETTING USERS
  getUsers: async (req, resp, next) => {
    const { page = 1, limit = 1000 } = req.query;

    // debe ser asíncrona. find() puede usarse como promesa
    try {
      const usersAndPages = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await User.countDocuments();

      const users = []
      usersAndPages.forEach(el => {
        let user = {
          id: el._id,
          email: el.email,
          roles: el.roles
        }
        users.push(user)
      })

      const uri = `http://127.0.0.1/users/?`
      resp.set('Link', pagination(uri, count, page, limit))

      return resp.json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (err) {
      console.log(err.message)
    }
    return next()
  },

  // GET ONE USER BY EMAIL OR ID
  getUserByIdOrEmail: async (req, resp, next) => {
    const uid = req.params.uid;

    const { authorization } = req.headers;
    // console.log('AUTHO', authorization)
    if (!authorization) {
      return next(401);
    }

    try {
      const user = await User.findOne(getIdOrEmail(uid)).exec();
      return resp.json({
        id: user._id,
        email: user.email,
        roles: user.roles
      })

    } catch (error) {
      console.log(error.message)
      if (error.message === 'ID inválido') {
        // return resp.send('ID inválido')
        return resp.status(404).json({
          statusCode: 404,
          message: 'ID inválido'
        });
      }
      return resp.status(404).json({
        statusCode: 404,
        message: 'ID inválido'
      });
      // return resp.send('Email inválido')
    }
  },

  // CREATE NEW USER
  createNewUser: async (req, resp, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(401);
    }

    const { email, password, roles } = req.body

    if (!email || !password) {
      return next(400);
    }

    const newUser = new User({
      email: email,
      password: bcrypt.hashSync(password, 10),
      roles: roles
    })

    await User.findOne({ email: email }, (err, user) => {
      if (!user) {
        User.create(newUser)
        resp.send({
          id: newUser._id,
          email: newUser.email,
          roles: newUser.roles
        })
      } else {
        next(403)
      }
    })
    next()
  },

  // UPDATE AN EXISTING USER
  updateUser: async (req, resp, next) => {
    const uidToUpdate = req.params.uid;
    const { email, password, roles } = req.body
    const { authorization } = req.headers;

    const [type, token] = authorization.split(' ');
    const decodedToken = jwt.decode(token, { complete: true });
    const uid = decodedToken.payload.uid

    const user = await User.findOne(getIdOrEmail(uidToUpdate)).exec();

    if (!isAdmin(req) && (uid !== user.id)) {
      return next(403)
    }

    if ((uid === user.id) && req.body.roles) {
      return next(403)
    }

    if (!email && !password && !roles) {
      return next(400)
    }

    user.password = bcrypt.hashSync(password, 10) || user.password;
    user.email = email || user.email;
    user.roles = roles || user.roles
    user.save()

    return resp.json({
      id: user._id,
      email: user.email,
      roles: user.roles
    })

  },

  // DELETE AN USER
  deleteUser: async (req, resp, next) => {
    const uidToUpdate = req.params.uid;
    const { authorization } = req.headers;

    const [type, token] = authorization.split(' ');
    const decodedToken = jwt.decode(token, { complete: true });
    const uid = decodedToken.payload.uid // Connected user id

    const user = await User.findOne(getIdOrEmail(uidToUpdate)).exec();

    if (!isAdmin(req) && (uid !== user.id)) {
      return next(403)
    }

    if ((uid === user.id) && req.body.roles) {
      return next(403)
    }

    if (!user) {
      return next(404)
    }

    User.deleteOne(getIdOrEmail(uidToUpdate))
      .then(data => console.log('Se borró el usaurio: ', user.email))
      .catch(error => console.log('No se pudo borrar'))

    return resp.json({
      id: user._id,
      email: user.email,
      roles: user.roles
    })

  }
};
