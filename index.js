const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');

const { port, dbUrl, secret } = config;
const app = express();

// TODO: Conexión a la Base de Datos (MongoDB o MySQL)
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((db) => console.log('connected to db'))
  .catch(e => console.log('EL ERROR', e))

// mongoose.set('useFindAndModify', false)
app.set('config', config);
app.set('pkg', pkg);

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

// Registrar rutas
routes(app, (err) => {
  console.log('Connected to mongodb')
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  mongoose.connection.once('open', () => {
    app.listen(port, () => {
      console.info(`App listening on port ${port}`);
    });
  })
});
