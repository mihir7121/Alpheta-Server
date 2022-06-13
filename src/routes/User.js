import { Router } from "express";
import { body, param, query } from "express-validator";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import * as UserController from './../controllers/User.js'

const router = new Router();

router.post('/authenticate', 
  body('address').isString().isLength({min: 1}),
  validate,
  UserController.authenticate
)

router.post('/verify', 
  body('address').isString().isLength({min: 1}),
  body('signature').isString().isLength({min: 1}),
  validate,
  UserController.verify
)

router.get('/leaderboard',
  query('limit').optional().default(20).isInt({min: 1, max: 50}),
  validate,
  UserController.leaderboard
)

router.get('/view/:address',
  param('address').isString().isLength({min: 1}),
  validate,
  UserController.profile
)

router.get('/view/:address/favourites',
  param('address').isString().isLength({min: 1}),
  validate,
  UserController.viewFavourites
)

router.get('/view/:address/activities',
  param('address').isString().isLength({min: 1}),
  validate,
  UserController.viewActivities
)

router.get('/ip', (req, res) => res.send(req.ip))

router.get('/interactions',
  authenticate,
  UserController.getInteractions
)

router.post('/feedback', 
  body('email').isString().isEmail(),
  body('feedback').isString().isLength({min: 5, max: 200}),
  validate,
  UserController.feedback
)

router.post('/follow', 
  body('address'),
  validate,
  authenticate,
  UserController.follow
)

router.post('/unfollow', 
  body('address'),
  validate,
  authenticate,
  UserController.unfollow
)

export default router