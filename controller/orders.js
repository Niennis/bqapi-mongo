const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const { isAdmin } = require('../middleware/auth')
const { pagination, getIdOrEmail, arrProducts } = require('../utils/index')

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
          id: el._id,
          userId: el.userId,
          client: el.client,
          products: arrProducts(el.products),
          status: el.status,
          dateEntry: el.dateEntry,
          dateProcessed: el.dateProcessed
        }
        orders.push(order)
      })

      const uri = `http://127.0.0.1/orders/?`
      resp.set('Link', pagination(uri, count, page, limit))

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
    const { client, products, userId } = req.body;
    if (!products) {
      return next(400)
    }
    
    if (!userId) {
      return next(400)
    }
    
    let order = new Order({
      userId: userId,
      client: client,
      products: products,
      status: 'pending',
      dateEntry: new Date
    })

    try {
      Order.create(order)
      resp.send({
        orderId: order._id,
        userId: order.userId,
        client: order.client,
        products: order.products,
        status: order.status,
        dateEntry: order.dateEntry
      })
    } catch (err) {
      return resp.json({
        statusCode: err.status,
        message: err.message
      });
    }

  },

  updateOrder: async (req, resp, next) => {

  },

  deleteOrder: async (req, resp, next) => {

  }

}

