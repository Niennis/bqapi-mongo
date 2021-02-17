const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const { isAdmin } = require('../middleware/auth')
const { pagination } = require('../utils/index')

module.exports = {

  getProducts: async (req, resp, next) => {
    const { page = 1, limit = 10 } = req.query;

    try {
      const productsAndPages = await Product.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Product.countDocuments();

      const products = []
      productsAndPages.forEach(el => {
        let product = {
          ID: el._id,
          Name: el.name,
          Price: el.price,
          Image: el.image,
          Type: el.type,
          Date: el.dateEntry
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

  getProductsById: (req, resp, next) => {

  },

  postProducts: (req, resp, next) => {

  },

  updateProducts: (req, resp, next) => {

  },

  deleteProducts: (req, resp, next) => {

  },
};