const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')
const path = require('path')
const password = process.env.DB_PASSWORD
const username = process.env.DB_USER
const helmet = require('helmet')

mongoose.connect(`mongodb+srv://${username}:${password}@clusterhottakes.wyuhewx.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Connexion à MongoDB échouée !' + err));

  const app = express();
  app.use(helmet())



  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');  
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
});

 
  app.use(express.json())
  app.use('/api/sauces', sauceRoutes);
  app.use('/api/auth', userRoutes);
  app.use('/images', express.static(path.join(__dirname, 'images')));
 
  const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,           
    optionSuccessStatus:200
  }
  app.use(cors(corsOptions));
 module.exports = app;