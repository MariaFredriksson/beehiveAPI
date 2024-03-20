/**
 * The starting point of the application.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import logger from 'morgan'
import { router } from './routes/router.js'
// import { connectDB } from './config/mongoose.js'
import helmet from 'helmet'

try {
  // Connect to MongoDB.
  // & Comment back this later!
  // await connectDB()

  // Creates an Express application.
  const expressApp = express()

  expressApp.use(helmet())

  expressApp.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'http://cscloud7-221.lnu.se', 'https://cscloud7-221.lnu.se'],
        scriptSrc: ["'self'", 'http://cscloud7-221.lnu.se', 'https://cscloud7-221.lnu.se']
      }
    })
  )

  // Set up a morgan logger using the dev format for log entries.
  // The 'dev' format is a predefined string that stands for :method :url :status :response-time ms - :res[content-length]
  expressApp.use(logger('dev'))

  // Parse requests of the content type application/json.
  // Tells Express to parse incoming request bodies that have the Content-Type header set to application/json.
  // The express.json() middleware parses this JSON data and makes it available in the req.body object, so you can access and work with the data in your route handlers.
  // It also sets a limit on the JSON payload size, which can be useful to prevent abuse or DOS attacks where large payloads are used to overload the server.
  expressApp.use(express.json({ limit: '500kb' }))

  // If the app is in production, extra layers of security are added
  if (expressApp.get('env') === 'production') {
    // Shows that this express application is run behind a reverse proxy, and which proxy that is trusted
    expressApp.set('trust proxy', 1) // trust first proxy
  }

  // Register routes.
  // The app.use() method is used to register middleware functions or objects with the Express application. The first argument passed to the app.use() method is the path that the middleware function or object should handle. In this case, the path is /, which means that the middleware function or object should handle all requests to the root path of the application.
  // router is the middleware object
  expressApp.use('/', router)

  // Error handler.
  // Good that this is placed at the end of the middleware chain, so this handler can take care of the errors that are not caught in the other middlewares of routes
  expressApp.use(function (err, req, res, next) {
    // Set the error status to the error status it already has, or 500 (Internal Server Error) if it doesn't have any
    err.status = err.status || 500

    // Don't give too much information about the error when the app is not in development mode
    if (req.app.get('env') !== 'development') {
      // Customized error messages for the different error statuses
      const errorMessages = {
        400: 'The request cannot or will not be processed due to something that is perceived to be a client error (for example, a validation error).',
        401: 'Access token invalid or not provided.',
        403: 'The request contained valid data and was understood by the server, but the server is refusing action due to the authenticated user not having the necessary permissions for the resource.',
        404: 'The requested resource was not found.',
        500: 'An unexpected condition was encountered.'
      }

      err.message = errorMessages[err.status]

      // Send just the error code and the error message
      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    }

    // Development only!
    // Only providing detailed error in development.
    return res
      .status(err.status)
      .json(err)
  })

  // Starts the HTTP server listening for connections.
  // This line of code starts the web server and makes it listen on the specified port, so that it can start processing incoming requests and sending back responses. This is the final step in the process of setting up the server and starting the application.
  expressApp.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
