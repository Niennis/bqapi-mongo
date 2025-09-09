const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');
const cors = require('cors')

const { port, dbUrl, secret } = config;
const app = express();

const allowedOrigins = [
  "https://bakequeen.vercel.app", // frontend en Vercel
  "http://localhost:3000"         // para desarrollo local
];

const corsOptions = {
  origin: function (origin, callback) {
    // permitir también requests sin "origin" (ej: curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  exposedHeaders: ["Link"],
  credentials: true, // solo para cookies/session
};

// TODO: Conexión a la Base de Datos (MongoDB o MySQL)
console.log('dburl', process.env.DB_URL)
mongoose.connect('mongodb+srv://admin:12345@cluster0.wmvjvke.mongodb.net/bq?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((db) => console.log('Connected to db'))
  .catch(e => console.log('Error:', e))

// mongoose.set('useFindAndModify', false)
app.set('config', config);
app.set('pkg', pkg);
app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

// Registrar rutas
routes(app, (err) => {
  console.log('Routes')
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
