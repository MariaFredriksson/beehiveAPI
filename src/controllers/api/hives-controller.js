/**
 * Module for the HivesController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { Beehive } from './../../models/beehive.js'
// import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class HivesController {
  /**
   * Adds a new hive to the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/hives
  async addHive (req, res, next) {
    try {
      // Extract information from the request body
      const { hiveId, name, location, registeredById } = req.body

      // Validate the data as needed (e.g., check for missing fields)
      // This is a simple example. Consider more thorough validation for production.
      // ^^ Change this validation maybe...?
      if ((!hiveId && hiveId !== 0) || !name || !location || !registeredById) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // ^^ Should hiveId be set by the user like this, or should it be given by the database?
      // ^^ If it should be some simple number, how should it be kept track of, so there isn't two hives with the same id?
      // ^^ Unique in the schema, but how should it be presented to the user if the id is taken?

      // Create a new hive
      const newHive = new Beehive({
        hiveId,
        name,
        location,
        registeredById
      })

      // Save the hive to the database
      const savedHive = await newHive.save()

      // Respond with the saved hive
      res.status(201).json(savedHive)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a hive in the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  // * This is called by doing a PUT to http://localhost:5030/api/v1/hives/:id
  async updateHive (req, res, next) {
    try {
      const hiveId = req.params.id
      const { name, location } = req.body

      if (!name || !location) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Find the resource to update by id, and then update it
      await Beehive.findOneAndUpdate({ id: hiveId }, {
        name,
        location
      }, { runValidators: true })

      // ^^ Can I include information about the updated hive in the response in some way?
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }
}
