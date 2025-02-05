/**
 * Module for the HivesController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import createError from 'http-errors'
import { createLink } from './../../utils/linkUtils.js'
import { Beehive } from './../../models/beehive.js'
import { BeehiveFlow } from './../../models/beehiveFlow.js'
import { BeehiveHarvest } from './../../models/beehiveHarvest.js'
import { BeehiveHumidity } from './../../models/beehiveHumidity.js'
import { BeehiveTemperature } from './../../models/beehiveTemperature.js'
import { BeehiveWeight } from './../../models/beehiveWeight.js'

/**
 * Encapsulates a controller.
 */
export class HivesController {
  /**
   * Fetches all the hives from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives
  async getAllHives (req, res, next) {
    try {
      // Get all the hives from the database
      const hives = await Beehive.find()

      // Create an object with only the information needed
      const hivesResponse = hives.map(hive => {
        return {
          hiveId: hive.hiveId,
          name: hive.name,
          location: hive.location,
          registeredById: hive.registeredById
        }
      })

      // Respond with the hives and hateoas links
      res.status(200).json({
        data: hivesResponse,
        links: [
          createLink('/hives', 'add-hive', 'POST')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

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

      // Respond with the saved hive and hateoas links
      res.status(201).json({
        data: savedHive,
        links: [
          createLink(`/hives/${savedHive.hiveId}`, 'get-hive-status', 'GET'),
          createLink(`/hives/${savedHive.hiveId}`, 'update-hive', 'PUT'),
          createLink(`/hives/${savedHive.hiveId}`, 'delete-hive', 'DELETE'),
          createLink('/hives', 'get-all-hives', 'GET')
        ]
      })
    } catch (error) {
      let err = error

      if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.cause = error
      }

      next(err)
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
      // res.status(204).end()

      // Respond with the saved hive and hateoas links
      res.status(200).json({
        message: 'Hive updated successfully.',
        links: [
          createLink(`/hives/${hiveId}`, 'get-hive-status', 'GET'),
          createLink(`/hives/${hiveId}`, 'delete-hive', 'DELETE'),
          createLink('/hives', 'get-all-hives', 'GET'),
          createLink('/hives', 'add-hive', 'POST')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes a hive and all the statistics about it from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a DELETE to http://localhost:5030/api/v1/hives/:id
  async deleteHive (req, res, next) {
    try {
      const hiveId = req.params.id

      // Delete all the flow, humidity, temperature, weight and harvest data for the hive as well
      await BeehiveFlow.deleteMany({ hiveId })
      await BeehiveHumidity.deleteMany({ hiveId })
      await BeehiveTemperature.deleteMany({ hiveId })
      await BeehiveWeight.deleteMany({ hiveId })
      await BeehiveHarvest.deleteMany({ hiveId })

      // Find the resource to delete by id, and then delete it
      await Beehive.findOneAndDelete({ hiveId })

      // Respond with the saved hive and hateoas links
      res.status(200).json({
        message: 'Hive deleted successfully.',
        links: [
          createLink('/hives', 'get-all-hives', 'GET'),
          createLink('/hives', 'add-hive', 'POST')
        ]
      })
    } catch (error) {
      next(error)
    }
  }
}
