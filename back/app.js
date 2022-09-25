const express = require('express');
const app = express();
const mongoose = require('mongoose');

const path = require('path')
const helmet = require('helmet')


const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')


  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

  require('dotenv').config()
const password = process.env.DB_PASSWORD
const username = process.env.DB_USER

mongoose.connect(`mongodb+srv://${username}:${password}@clusterhottakes.wyuhewx.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Connexion à MongoDB échouée !' + err));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');  
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

  app.use(express.json());
  
  app.use('/images', express.static(path.join(__dirname, 'images')));
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
   
 module.exports = app;