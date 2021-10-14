const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
var authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            for (var i=0; i<req.body.length; i++) {
                if (favorite.dishes.indexOf(req.body[i]._id) === -1) {
                    favorite.dishes.push(req.body[i]._id);
                }
            }
            favorite.save()
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err)); 
        }
        else {
            Favorites.create({"user": req.user._id, "dishes": req.body})
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));  
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({"user": req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));   
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {            
            if (favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId)
                favorite.save()
                .then((favorite) => {
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
            }
        }
        else {
            Favorites.create({"user": req.user._id, "dishes": [req.params.dishId]})
            .then((favorite) => {
                console.log('Favorite Created ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {            
            index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('Favorite Dish Deleted!', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = favoriteRouter;


// const express = require('express');
// const bodyParser = require('body-parser');
// const Favorites = require('../models/favorites');
// const authenticate = require('../authenticate');
// const cors = require('./cors');

// const favoriteRouter = express.Router();

// favoriteRouter.use(bodyParser.json());

// //  default
// favoriteRouter.route('/')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
// .get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     Favorites.findOne({ user: req.user._id })
//     .populate('user')
//     .populate('dishes')
//     .then((favoriteList) => {
//         if (!favoriteList) {
//             res.send("null");
//         }
//         res.json(favoriteList);
//     })
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
//     Favorites.findOne({ user: req.user._id })
//     .then((user) => {
//         if (!user) {
//             Favorites.create({
//                 user: req.user._id,
//                 dishes: [...req.body]
//             })
//             .then(response => {
//                 res.json(response);
//             })
//         }
//     })
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /favorites');
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     Favorites.findOneAndRemove({ user: req.user._id })
//     .then(response => {
//         res.json(response);
//     })
// })

// favoriteRouter.route('/:dishId')
// .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
// .get(cors.cors, authenticate.verifyAdmin, (req,res,next) => {
//     Favorites.findOne({user: req.user._id})
//     .then((favorites) => {
//         if (!favorites) {
//             res.statusCode = 200;
//             res.setHeader('Content-Type', 'application/json');
//             return res.json({"exists": false, "favorites": favorites});
//         }
//         else {
//             if (favorites.dishes.indexOf(req.params.dishId) < 0) {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 return res.json({"exists": false, "favorites": favorites});
//             }
//             else {
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type', 'application/json');
//                 return res.json({"exists": true, "favorites": favorites});
//             }
//         }

//     }, (err) => next(err))
//     .catch((err) => next(err))
// })
// .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     Favorites.findOne({ user: req.user._id })
//     .then(favorites => {
//         if (favorites == null) {
//             Favorites.create({ user: req.user._id, dishes: [ req.params.dishId ]})
//             .then(favorites => {
//                 res.json(favorites);
//                 return;
//             })
//         } else {
//             let newDishes = [...favorites.dishes, req.params.dishId];
//             favorites.dishes = newDishes;
//             favorites.save()
//             .then(response => {
//                 res.json(response)
//             })
//         }
//     })
// })
// .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     res.statusCode = 403;
//     res.end('PUT operation not supported on /favorites/:dishId')
// })
// .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
//     Favorites.findOneAndUpdate({ user: req.user._id })
//     .then((favorites) => {
//         if (favorites == null) {
//             res.end('List is empty!')
//             return;
//         } else {
//             favorites.dishes = favorites.dishes.filter(id => id != req.params.dishId);
//             favorites.save()
//             .then(response => {
//                 res.json(response);
//             });
//         }
//     })
// })

// module.exports = favoriteRouter;




















// // my assignment of week 4
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const mongoose = require('mongoose');
// // const authenticate = require('../authenticate');
// // const cors = require('./cors');
// // const Favourites = require('../models/favourite');

// // const favouriteRouter = express.Router();

// // favouriteRouter.use(bodyParser.json());

// // favouriteRouter.route('/')
// // .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// // .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
// //     Favourites.find({})
// //         .populate('user')
// //         .populate('dishes')
// //         .then((favourites) => {
// //             // extract favourites that match the req.user.id
// //             if (favourites) {
// //                 user_favourites = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
// //                 if(!user_favourites) {
// //                     var err = new Error('You have no favourites!');
// //                     err.status = 404;
// //                     return next(err);
// //                 }
// //                 res.statusCode = 200;
// //                 res.setHeader("Content-Type", "application/json");
// //                 res.json(user_favourites);
// //             } else {
// //                 var err = new Error('There are no favourites');
// //                 err.status = 404;
// //                 return next(err);
// //             }
            
// //         }, (err) => next(err))
// //         .catch((err) => next(err));
// // })
// // .post(cors.corsWithOptions, authenticate.verifyUser, 
// //     (req, res, next) => {
// //         Favourites.find({})
// //             .populate('user')
// //             .populate('dishes')
// //             .then((favourites) => {
// //                 var user;
// //                 if(favourites)
// //                     user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
// //                 if(!user) 
// //                     user = new Favourites({user: req.user.id});
// //                 for(let i of req.body){
// //                     if(user.dishes.find((d_id) => {
// //                         if(d_id._id){
// //                             return d_id._id.toString() === i._id.toString();
// //                         }
// //                     }))
// //                         continue;
// //                     user.dishes.push(i._id);
// //                 }
// //                 user.save()
// //                     .then((userFavs) => {
// //                         res.statusCode = 201;
// //                         res.setHeader("Content-Type", "application/json");
// //                         res.json(userFavs);
// //                         console.log("Favourites Created");
// //                     }, (err) => next(err))
// //                     .catch((err) => next(err));
                
// //             })
// //             .catch((err) => next(err));
// // })

// // .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
// //     res.statusCode = 403;
// //     res.end('PUT operation is not supported on /favourites');
// // })
// // .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
// //     Favourites.find({})
// //         .populate('user')
// //         .populate('dishes')
// //         .then((favourites) => {
// //             var favToRemove;
// //             if (favourites) {
// //                 favToRemove = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
// //             } 
// //             if(favToRemove){
// //                 favToRemove.remove()
// //                     .then((result) => {
// //                         res.statusCode = 200;
// //                         res.setHeader("Content-Type", "application/json");
// //                         res.json(result);
// //                     }, (err) => next(err));
                
// //             } else {
// //                 var err = new Error('You do not have any favourites');
// //                 err.status = 404;
// //                 return next(err);
// //             }
// //         }, (err) => next(err))
// //         .catch((err) => next(err));
// // });

// // favouriteRouter.route('/:dishId')
// // .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
// // .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
// //     Favourites.find({})
// //         .populate('user')
// //         .populate('dishes')
// //         .then((favourites) => {
// //             if (favourites) {
// //                 const favs = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
// //                 const dish = favs.dishes.filter(dish => dish.id === req.params.dishId)[0];
// //                 if(dish) {
// //                     res.statusCode = 200;
// //                     res.setHeader("Content-Type", "application/json");
// //                     res.json(dish);
// //                 } else {
// //                     var err = new Error('You do not have dish ' + req.params.dishId);
// //                     err.status = 404;
// //                     return next(err);
// //                 }
// //             } else {
// //                 var err = new Error('You do not have any favourites');
// //                 err.status = 404;
// //                 return next(err);
// //             }
// //         }, (err) => next(err))
// //         .catch((err) => next(err));
// // })
// // .post(cors.corsWithOptions, authenticate.verifyUser, 
// //     (req, res, next) => {
// //         Favourites.find({})
// //             .populate('user')
// //             .populate('dishes')
// //             .then((favourites) => {
// //                 var user;
// //                 if(favourites)
// //                     user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
// //                 if(!user) 
// //                     user = new Favourites({user: req.user.id});
// //                 if(!user.dishes.find((d_id) => {
// //                     if(d_id._id)
// //                         return d_id._id.toString() === req.params.dishId.toString();
// //                 }))
// //                     user.dishes.push(req.params.dishId);
                
// //                 user.save()
// //                     .then((userFavs) => {
// //                         res.statusCode = 201;
// //                         res.setHeader("Content-Type", "application/json");
// //                         res.json(userFavs);
// //                         console.log("Favourites Created");
// //                     }, (err) => next(err))
// //                     .catch((err) => next(err));

// //             })
// //             .catch((err) => next(err));
// // })

// // .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
// //     res.statusCode = 403;
// //     res.end('PUT operation is not supported on /favourites/:dishId');
// // })
// // .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
// //     Favourites.find({})
// //         .populate('user')
// //         .populate('dishes')
// //         .then((favourites) => {
// //             var user;
// //             if(favourites)
// //                 user = favourites.filter(fav => fav.user._id.toString() === req.user.id.toString())[0];
// //             if(user){
// //                 user.dishes = user.dishes.filter((dishid) => dishid._id.toString() !== req.params.dishId);
// //                 user.save()
// //                     .then((result) => {
// //                         res.statusCode = 200;
// //                         res.setHeader("Content-Type", "application/json");
// //                         res.json(result);
// //                     }, (err) => next(err));
                
// //             } else {
// //                 var err = new Error('You do not have any favourites');
// //                 err.status = 404;
// //                 return next(err);
// //             }
// //         }, (err) => next(err))
// //         .catch((err) => next(err));
// // });

// // module.exports = favouriteRouter;

// // in case if needed the extra code 
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const Favorites = require('../models/favorites');
// // const authenticate = require('../authenticate');
// // const cors = require('./cors');

// // const favoriteRouter = express.Router();

// // favoriteRouter.use(bodyParser.json());

// // //  default
// // favoriteRouter.route('/')
// // .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
// // .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     Favorites.findOne({ user: req.user._id })
// //     .populate('user')
// //     .populate('dishes')
// //     .then((favoriteList) => {
// //         if (!favoriteList) {
// //             res.send("null");
// //         }
// //         res.json(favoriteList);
// //     })
// // })
// // .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
// //     Favorites.findOne({ user: req.user._id })
// //     .then((user) => {
// //         if (!user) {
// //             Favorites.create({
// //                 user: req.user._id,
// //                 dishes: [...req.body]
// //             })
// //             .then(response => {
// //                 res.json(response);
// //             })
// //         }
// //     })
// // })
// // .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     res.statusCode = 403;
// //     res.end('PUT operation not supported on /favorites');
// // })
// // .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     Favorites.findOneAndRemove({ user: req.user._id })
// //     .then(response => {
// //         res.json(response);
// //     })
// // })

// // favoriteRouter.route('/:dishId')
// // .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
// // .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     res.statusCode = 403;
// //     res.end('GET operation not supported on /favorites/:dishId')
// // })
// // .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     Favorites.findOne({ user: req.user._id })
// //     .then(favorites => {
// //         if (favorites == null) {
// //             Favorites.create({ user: req.user._id, dishes: [ req.params.dishId ]})
// //             .then(favorites => {
// //                 res.json(favorites);
// //                 return;
// //             })
// //         } else {
// //             let newDishes = [...favorites.dishes, req.params.dishId];
// //             favorites.dishes = newDishes;
// //             favorites.save()
// //             .then(response => {
// //                 res.json(response)
// //             })
// //         }
// //     })
// // })
// // .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     res.statusCode = 403;
// //     res.end('PUT operation not supported on /favorites/:dishId')
// // })
// // .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
// //     Favorites.findOneAndUpdate({ user: req.user._id })
// //     .then((favorites) => {
// //         if (favorites == null) {
// //             res.end('List is empty!')
// //             return;
// //         } else {
// //             favorites.dishes = favorites.dishes.filter(id => id != req.params.dishId);
// //             favorites.save()
// //             .then(response => {
// //                 res.json(response);
// //             });
// //         }
// //     })
// // })

// // module.exports = favoriteRouter;