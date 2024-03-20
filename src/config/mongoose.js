/**
 * Mongoose configuration.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import mongoose from 'mongoose'

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if connection succeeded.
 */
// Connects to the MongoDB server by using Mongoose
export const connectDB = async () => {
  const { connection } = mongoose

  // Bind connection to events (to get notifications).
  // Uses the on method of the connection object to register event listeners for different events that can occur
  connection.on('connected', () => console.log('MongoDB connection opened.'))
  connection.on('error', (err) => console.error(`MongoDB connection error occurred: ${err}`))
  connection.on('disconnected', () => console.log('MongoDB is disconnected.'))

  // If the Node.js process ends, close the connection.
  // Sets up a listener for the SIGINT event, which happens when the node.js process is interupted, eg when the user types ctrl+c in the terminal
  process.on('SIGINT', () => {
    // Then, the connection to the mongodb server is closed, a message is printed and the process ends with exitcode 0
    connection.close(() => {
      console.log('MongoDB disconnected due to application termination.')
      process.exit(0)
    })
  })

  // Connect to the server.
  return mongoose.connect(process.env.DB_CONNECTION_STRING)
}
