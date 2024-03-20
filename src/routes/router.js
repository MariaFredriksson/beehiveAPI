/**
 * The routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { router as apiV1Router } from './api/v1/router.js'

export const router = express.Router()

router.use('/api/v1', apiV1Router)

// If any url is requested that doesn't match the above, there will be an error
router.use('*', (req, res, next) => {
  // Sends a 404 error to the the next middleware, which will trigger the error handler
  next(createError(404))
})
