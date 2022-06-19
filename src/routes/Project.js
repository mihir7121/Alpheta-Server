import { Router } from "express";
import { body, query } from "express-validator";
import authenticate from "../middleware/authenticate.js";
import validate from "../middleware/validate.js";
import * as ProjectController from './../controllers/Project.js'

const router = new Router();

router.get('/explore', 
  query('limit').optional().default(20).isInt({min: 1, max: 50}),
  query('page').optional().default(1).isInt({min: 1}),
  ProjectController.explore
)

router.get('/leaderboard',
  query('limit').optional().default(20).isInt({min: 1, max: 20}),
  validate,
  ProjectController.leaderboard
)

router.get('/view/:slug', ProjectController.view)

router.post('/review', 
  body('slug'),
  body('text'),
  body('score'),
  validate,
  authenticate,
  ProjectController.addReview
)

router.post('/favourite', 
  body('slug'),
  validate,
  authenticate,
  ProjectController.favourite
)

router.post('/unfavourite', 
  body('slug'),
  validate,
  authenticate,
  ProjectController.unfavourite
)

export default router