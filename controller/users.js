const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = {
  // GETTING USERS
  getUsers: async (req, resp, next) => {
    const { page = 1, limit = 10 } = req.query;

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
          roles: el.roles.keys(),
          admin: el.roles.get('admin')
        }
        users.push(user)
      })

      resp.json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (err) {
      console.log(err.message)
    }
  },

  // GET ONE USER BY EMAIL OR ID
  getUserByIdOrEmail: async (req, resp, next) => {
    const uid = req.params.uid;
    console.log(uid)

    const { authorization } = req.headers;
    console.log('AUTHO', authorization)
    if (!authorization) {
      return next(401);
    }

    try {
      const user = await User.findOne(getIdOrEmail(uid)).exec();
      return resp.json({
        id: user._id,
        email: user.email,
        roles: user.roles,
        admin: user.roles.get('admin')
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
          roles: newUser.roles,
          admin: newUser.roles.admin
        })
      } else {
        next(403)
      }
    })
    next()
  }

  // UPDATE AN EXISTING USER


  
  // DELETE AN USER
};

// IDENTIFY IF INPUT IS EMAIL OR ID
const getIdOrEmail = (input) => {
  if (input.indexOf('@') > 0) {
    return ({ email: input })
  }
  if (!mongoose.Types.ObjectId.isValid(input)) {
    throw new Error('ID inválido')
  }
  return ({ _id: input })

}