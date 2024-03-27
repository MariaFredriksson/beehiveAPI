/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { router as hivesRouter } from './hives-router.js'
import { router as harvestRouter } from './harvest-router.js'
import { router as mobileBeehiveRouter } from './mobile-beehive-router.js'
import { router as userRouter } from './user-router.js'
import { router as webhookRouter } from './webhook-router.js'
import { createLink } from './../../../utils/linkUtils.js'
import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

/**
 * Authenticates requests. Controls that the JWT is a correct JWT.
 *
 * If authentication is successful, `req.user`is populated and the
 * request is authorized to continue.
 * If authentication fails, an unauthorized response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    // The ? is there because the header authorization might not exist, and if it isn't there the split will not throw an exception now, but be caught in the next if
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    // Check if the authentication scheme is the right type, since we want the JWT to be sent as a bearer
    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    // Authenticate the user with the built in method verify in jsonwebtoken, which will throw an exception if the token is invalid
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] })

    console.log(`User ${payload.email} authenticated.`)

    // Log when the token was issued and when it expires
    console.log('The token was issued at:', new Date(payload.iat * 1000))
    console.log('The token expires at:', new Date(payload.exp * 1000))

    // Populate the req.user with useful information from the payload
    req.user = {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      role: payload.x_role
    }

    next()
  } catch (err) {
    const error = createHttpError(401)
    error.cause = err
    next(error)
  }
}

/**
 * Checks if the user is a farmer.
 * If the user is a farmer, the request is authorized to continue.
 * If the user is not a farmer, a forbidden response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const isFarmer = (req, res, next) => {
  if (req.user.role === 'farmer') {
    next()
  } else {
    const error = createHttpError(403)
    error.message = 'You are not authorized to access this resource.'
    next(error)
  }
}

export const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'Hooray! Welcome to the Beehive Monitoring API!',
    links: [
      createLink('/user/register', 'register', 'POST'),
      createLink('/user/login', 'login', 'POST'),
      createLink('/hives', 'get-all-hives', 'GET'),
      createLink('/hives', 'add-hive', 'POST'),
      createLink('/harvest', 'get-all-harvests', 'GET'),
      createLink('/harvest', 'add-harvest', 'POST'),
      createLink('/mobile-beehive-request', 'get-all-mobile-beehive-requests', 'GET'),
      createLink('/mobile-beehive-request', 'add-mobile-beehive-request', 'POST'),
      createLink('/webhook/register', 'register-webhook', 'POST')
    ]
  })
})

// User routes (doesn't require JWT authentication for all actions)
router.use('/user', userRouter)

// Apply authenticateJWT middleware before accessing the specific routes
router.use('/hives', authenticateJWT, hivesRouter)
router.use('/harvest', authenticateJWT, isFarmer, harvestRouter)
router.use('/mobile-beehive-request', authenticateJWT, isFarmer, mobileBeehiveRouter)
router.use('/webhook', authenticateJWT, webhookRouter)
