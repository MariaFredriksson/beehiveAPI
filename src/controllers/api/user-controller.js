/**
 * Module for the UserController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { BeehiveUser } from './../../models/beehiveUser.js'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'
import { createLink } from './../../utils/linkUtils.js'

/**
 * Encapsulates a controller.
 */
export class UserController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/user/login
  async login (req, res, next) {
    try {
      // Login the user with the authenticate method in the BeehiveUser model. (The method will throw an error if the authentication fails.)
      const user = await BeehiveUser.authenticate(req.body.email, req.body.password)

      console.log(`User ${user.email} authenticated.`)

      // Create the payload for the access token with the user data.
      const payload = {
        email: user.email,
        given_name: user.firstName,
        family_name: user.lastName,
        x_role: user.role
      }

      // ^^ We cannot have algorithm: 'RS256' right? Because we are using the symmetric encryption. So we need to change this to 'HS256' (which is default) right?
      // Create the access token using the payload and the secret key.
      // Symmetric encryption is used here (HS256), so the same secret key is used to sign and verify the token.
      // The time limit is probably set to 30 minutes (1800000) which would be a bit long if it was a real application.
      // To make this more secure, I could use a shorter time limit and also use a refresh token.
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      console.log('JWT access token created.')

      res
        .status(201)
        .json({
          data: {
            accessToken
          },
          links: [
            createLink('/user/register', 'register', 'POST')
          ]
        })
    } catch (error) {
      // Authentication failed.
      const err = createError(401)
      err.cause = error

      next(err)
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/user/register
  async register (req, res, next) {
    try {
      const beehiveUser = new BeehiveUser({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role
      })

      await beehiveUser.save()

      console.log(`User ${beehiveUser.email} registered.`)

      // ^^ Is it maybe a dumb idea to send the whole user object back to the client? With the (hashed and salted) password and all? Maybe we should only send some information?
      res
        .status(201)
        .json({
          data: beehiveUser,
          links: [
            createLink('/user/login', 'login', 'POST')
          ]
        })
    } catch (error) {
      let err = error

      if (err.code === 11000) {
        // Duplicated keys.
        err = createError(409)
        err.cause = error
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.cause = error
      }

      next(err)
    }
  }
}
