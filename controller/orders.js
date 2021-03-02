const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const { isAdmin } = require('../middleware/auth')
const { pagination, getIdOrEmail } = require('../utils/index')

module.exports = {

  getOrders: async (req, resp, next) => {
    const { page = 1, limit = 5 } = req.query;

    try {
      const ordersAndPages = await Order.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Order.countDocuments();

      const orders = [];

      ordersAndPages.forEach(el => {
        let order = {
          userId: el._id,
          client: el.client,
          products: arrProducts(el.products),
          status: el.status,
          dataEntry: el.dataEntry,
          dataProcessed: el.dataProcessed
        }
        orders.push(order)
      })

      const uri = `http://127.0.0.1/orders/?`
      resp.set('Link', pagination(uri, count, page, limit))
      console.log('RESP', resp.get('Link'))

      resp.json({
        orders,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (err) {
      console.log(err.message)
    }
  },

  getOrderById: async (req, resp, next) => {

  },

  newOrder: async (req, resp, next) => {

  },

  updateOrder: async (req, resp, next) => {

  },

  deleteOrder: async (req, resp, next) => {

  }

}


const arrProducts = (arr) => {
  let products = [];
  arr.forEach(el => {
    let prod = {
    qty: el.qty,
    product: el.product
    }
    products.ṕush(prod)
  })
}