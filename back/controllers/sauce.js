const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
 const sauceObject = JSON.parse(req.body.sauce);
 delete sauceObject._id;
 const sauce = new Sauce ({
  ...sauceObject,
  imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
 });

 sauce.save()
 .then(() =>  res.status(201).json({message: 'Objet enregistré !'}))
 .catch(error =>  res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
  .then((sauce) => {res.status(200).json(sauce);
  }
  ).catch( (error) => { res.status(404).json({error: error });
    });
  };

exports.modifySauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        const sauceObject = req.file ? {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
      });
    });
};
             
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
        .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(401).json({ error }));
};
         
exports.getAllSauce = (req, res, next) => {
    Sauce.find().then((sauces) => { res.status(200).json(sauces);
    }).catch(
     (error) => {res.status(400).json({error: error});
      });
  };

  exports.likeSauce = (req, res, next) => {
    const sauceId = req.params.id;
    const userId = req.body.userId;
    const like = req.body.like;
    if (like === 1) {
      Sauce.updateOne(
        { _id: sauceId },
        {
          $inc: { likes: like },
          $push: { usersLiked: userId },
        }
      )
        .then((sauce) => res.status(200).json({ message: "L'utilisateur Like" }))
        .catch((error) => res.status(500).json({ error }));
    }
  
    // l'utilisateur met pour la premiere fois un dislike (like === -1)
    else if (like === -1) {
      Sauce.updateOne(
        { _id: sauceId },
        {
          $inc: { dislikes: -1 * like },
          $push: { usersDisliked: userId },
        }
      )
        .then((sauce) => res.status(200).json({ message: "L'utilisateur Dislike" }))
        .catch((error) => res.status(500).json({ error }));
    }
    // les changements d'avis de l'utilisateur :
    // l'utilisateur change d'avis sur son like
    else {
      Sauce.findOne({ _id: sauceId })
        .then((sauce) => {
          if (sauce.usersLiked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
            )
              .then((sauce) => {
                res.status(200).json({ message: "L'utilisateur annule son Like" });
              })
              .catch((error) => res.status(500).json({ error }));
            // l'utilisateur change d'avis sur son dislike
          } else if (sauce.usersDisliked.includes(userId)) {
            Sauce.updateOne(
              { _id: sauceId },
              {
                $pull: { usersDisliked: userId },
                $inc: { dislikes: -1 },
              }
            )
              .then((sauce) => {
                res.status(200).json({ message: "L'utilisateur annule son Dislike" });
              })
              .catch((error) => res.status(500).json({ error }));
          }
        })
        .catch((error) => res.status(401).json({ error }));
    }
  };