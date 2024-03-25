/**
 * Module for the HarvestController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { BeehiveHarvest } from './../../models/beehiveHarvest.js'

/**
 * Encapsulates a controller.
 */
export class HarvestController {
  /**
   * Adds a new harvest report to the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/harvest
  async addHarvest (req, res, next) {
    try {
      // Extract information from the request body
      const { hiveId, date, amount, userId } = req.body

      // Validate the data as needed (e.g., check for missing fields)
      // This is a simple example. Consider more thorough validation for production.
      // ^^ Change this validation maybe...?
      if ((!hiveId && hiveId !== 0) || !date || !amount || !userId) {
        // ^^ Do I really need ta have a return here...?
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Create a new harvest report
      const newHarvest = new BeehiveHarvest({
        hiveId,
        date,
        amount,
        userId
      })

      // Save the harvest report to the database
      const savedHarvest = await newHarvest.save()

      // Respond with the saved harvest report
      // ^^ Consider using .toJSON() if you want to apply transformations like removing _id and __v
      res.status(201).json(savedHarvest)
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error)
    }
  }
}
