/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @author Mats Loock
 * @version 2.0.0
 */

import express from 'express'
import { ResourcesController } from '../../../controllers/api/resources-controller.js'
import createError from 'http-errors'
import jwt from 'jsonwebtoken'

export const router = express.Router()

const controller = new ResourcesController()

// The numbers can be read in binary, where READ is 0001, CREATE is 0010, UPDATE is 0100 and DELETE is 1000
const PermissionLevels = Object.freeze({
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8
})

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
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_PUBLIC_KEY, { algorithms: ['RS256'] })

    console.log(`User ${payload.sub} authenticated.`)

    // Log when the token was issued and when it expires
    console.log('The token was issued at:', new Date(payload.iat * 1000))
    console.log('The token expires at:', new Date(payload.exp * 1000))

    // Populate the req.user with useful information from the payload
    req.user = {
      username: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      permissionLevel: payload.x_permission_level
    }

    next()
  } catch (err) {
    const error = createError(401)
    error.cause = err
    next(error)
  }
}

/**
 * Authorize requests.
 *
 * If authorization is successful, that is the user is granted access
 * to the requested resource, the request is authorized to continue.
 * If authentication fails, a forbidden response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @param {number} permissionLevel - The permission level required to access the resource.
 */
const hasPermission = (req, res, next, permissionLevel) => {
  // The bitwise AND (&) operation is used to check if the user's permission level (req.user.permissionLevel) includes the required permission level (permissionLevel).
  req.user?.permissionLevel & permissionLevel
    ? next() // If the before is true
    : next(createError(403)) // Else

  // Let's say we have a user with the permission level 6, which corresponds to the combination of CREATE (2) and UPDATE (4) permissions.
  // userPermissionLevel: 6   (Binary: 0110)
  // requiredPermissionLevel: 2   (Binary: 0010)
  //
  // Apply the bitwise AND operation to each pair of corresponding bits:
  //   0110(userPermissionLevel)
  // & 0010(requiredPermissionLevel)
  // ----
  //   0010(result of the bitwise AND operation)
  //
  // Convert the result back to decimal to interpret the permissions:
  // Result of bitwise AND: 0010 (Binary) = 2 (Decimal) - which corresponds to the CREATE permission, and will be true in the if statement above.
}

// GET tasks
router.get('/', authenticateJWT, (req, res, next) =>
  hasPermission(req, res, next, PermissionLevels.READ), (req, res, next) =>
  controller.getAll(req, res, next)
)

// GET tasks/:id
router.get('/:id', authenticateJWT, (req, res, next) =>
  hasPermission(req, res, next, PermissionLevels.READ), (req, res, next) =>
  controller.getOne(req, res, next)
)

// POST tasks
router.post('/', authenticateJWT, (req, res, next) =>
  hasPermission(req, res, next, PermissionLevels.CREATE), (req, res, next) =>
  controller.create(req, res, next)
)

// PATCH tasks/:id
router.patch('/:id', authenticateJWT, (req, res, next) =>
  hasPermission(req, res, next, PermissionLevels.UPDATE), (req, res, next) =>
  controller.updatePartially(req, res, next)
)

// PUT tasks/:id
router.put('/:id', authenticateJWT, (req, res, next) =>
  hasPermission(req, res, next, PermissionLevels.UPDATE), (req, res, next) =>
  controller.updateWhole(req, res, next)
)

// DELETE tasks/:id
router.delete('/:id', authenticateJWT, (req, res, next) =>
  hasPermission(req, res, next, PermissionLevels.DELETE), (req, res, next) =>
  controller.delete(req, res, next)
)
