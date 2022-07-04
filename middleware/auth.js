const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  // console.log('HEADERS middle', req.headers, authorization)
  if (!authorization) {
    return next();
  }
  
  const [type, token] = authorization.split(' ');
  
  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      console.log('ENTRÓ AL ERROR')
      return next(403);
    }
    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    User.findOne({ _id: decodedToken.uid }, (err, user) => {
      if (err) { 
        console.log('EL ERROR 500', err) 
        return next(500, err) 
      }
      req.headers.user = user
      next()
    })
  });
};

module.exports.isAuthenticated = (req) => (
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  req.headers.user ? true : false
);

module.exports.isAdmin = (req) => (
  // TODO: decidir por la informacion del request si la usuaria es admin
  req.headers.user.roles.get('admin') ? true : false
);

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
