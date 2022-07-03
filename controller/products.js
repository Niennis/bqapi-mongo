const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const { isAdmin } = require('../middleware/auth')
const { pagination, getIdOrEmail } = require('../utils/index')

module.exports = {

  getProducts: async (req, resp, next) => {
    const { page = 1, limit = 1000 } = req.query;

    try {
      const productsAndPages = await Product.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Product.countDocuments();

      const products = []
      productsAndPages.forEach(el => {
        let product = {
          id: el._id,
          name: el.name,
          price: el.price,
          image: el.image,
          type: el.type,
          date: el.dateEntry
        }
        products.push(product)
      })

      const uri = `http://127.0.0.1/products/?`
      resp.set('Link', pagination(uri, count, page, limit))

      resp.json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (err) {
      console.log(err.message)
    }
  },

  getProductsById: async (req, resp, next) => {
    const uid = req.params.productId;
    console.log(req.params)
    const { authorization } = req.headers;
    if (!authorization) {
      return next(401);
    }

    if (uid.indexOf('@') > 0) {
      resp.send('ID inválida')
    }

    try {
      const product = await Product.findOne(getIdOrEmail(uid)).exec();
      return resp.json({
        id: product._id,
        name: product.name,
        price: product.price,
        img: product.image,
        type: product.type,
        dateEntry: product.dateEntry
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

  postProducts: async (req, resp, next) => {
    const { authorization } = req.headers;
    console.log('AUTH in product controller', authorization)
    if (!authorization) {
      return next(401);
    }

    const { name, price, image, type } = req.body

    if (!name || !price) {
      return next(400);
    }

    const date = new Date;

    const newProduct = new Product({
      name: name,
      price: price,
      image: image,
      type: type,
      dateEntry: date
    })
    
    try {
      await Product.findOne({ name: name }, (err, product) => {
        if (!product) {
          Product.create(newProduct)
          return resp.send({
            id: newProduct._id,
            name: newProduct.name,
            price: newProduct.price,
            image: newProduct.image,
            type: newProduct.type,
            dateEntry: newProduct.dateEntry
          })
        } else {
          return next(403)
        }
      })
      // next()
    }
    catch (error) {
      return resp.status(404).json({
        statusCode: 404,
        message: error.message
      });
    }
  },

  updateProducts: async (req, resp, next) => {
    const uidToUpdate = req.params.productId;
    const { name, price, image, type } = req.body

    if (!name && !price && !image && !type) {
      return next(400)
    }

    const product = await Product.findOne(getIdOrEmail(uidToUpdate)).exec();
    if (!product) {
      return next(404)
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.image = image || product.image;
    product.type = type || product.type;
    product.save()

    return resp.json({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
      dateEntry: product.dateEntry
    })
  },

  deleteProducts: async (req, resp, next) => {
    const uidToUpdate = req.params.productId;
    const { authorization } = req.headers;

    if (!authorization) {
      return next(401)
    }

    const product = await Product.findOne(getIdOrEmail(uidToUpdate)).exec();
    if (!product) {
      return next(404)
    }

    Product.deleteOne(getIdOrEmail(uidToUpdate))
      .then(data => console.log('Se borró el producto: ', product._id, product.name))
      .catch(error => console.log('No se pudo borrar', error.message))

    return resp.json({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
      dateEntry: product.dateEntry
    })
  },
};