/**
 * Module for the MobileBeehiveController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { createLink } from './../../utils/linkUtils.js'
import { MobileBeehiveRequest } from './../../models/mobileBeehiveRequest.js'
import { WebhookController } from './webhook-controller.js'

/**
 * Encapsulates a controller.
 */
export class MobileBeehiveController {
  /**
   * Fetches all the mobile beehive requests from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/mobile-beehive-request
  async getAllMobileBeehiveRequests (req, res, next) {
    try {
      // Get all the mobile beehive requests from the database
      const mobileBeehiveRequests = await MobileBeehiveRequest.find()

      // Create an object with only the information needed
      const mobileBeehiveRequestsResponse = mobileBeehiveRequests.map(mobileBeehiveRequest => {
        return {
          location: mobileBeehiveRequest.location,
          startDate: mobileBeehiveRequest.startDate,
          endDate: mobileBeehiveRequest.endDate,
          requestedById: mobileBeehiveRequest.requestedById
        }
      })

      // Respond with the mobile beehive requests and hateoas links
      res.status(200).json({
        data: mobileBeehiveRequestsResponse,
        links: [
          createLink('/mobile-beehive-request', 'add-mobile-beehive-request', 'POST')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Adds a new mobile beehive request to the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/mobile-beehive-request
  async addMobileBeehiveRequest (req, res, next) {
    try {
      // Extract information from the request body
      const { location, startDate, endDate, requestedById } = req.body

      // Validate the data as needed (e.g., check for missing fields)
      // This is a simple example. Consider more thorough validation for production.
      // ^^ Change this validation maybe...?
      if (!location || !startDate || !endDate || !requestedById) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Create a new mobile beehive request
      const newMobileBeehiveRequest = new MobileBeehiveRequest({
        location,
        startDate,
        endDate,
        requestedById
      })

      // Save the mobile beehive request to the database
      const savedMobileBeehiveRequest = await newMobileBeehiveRequest.save()

      // Respond with the saved mobile beehive request and hateoas links
      res.status(201).json({
        data: savedMobileBeehiveRequest,
        links: [
          createLink('/mobile-beehive-request', 'get-all-mobile-beehive-requests', 'GET')
        ]
      })

      // After sending the response, trigger the webhooks
      // No need to await this function as we don't need to wait for it to finish
      WebhookController.triggerWebhooks('addedHiveRequest', savedMobileBeehiveRequest)
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error)
    }
  }
}
