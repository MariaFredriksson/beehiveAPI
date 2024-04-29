/**
 * Module for the MobileBeehiveController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { createLink } from './../../utils/linkUtils.js'
import { MobileBeehiveEnquiry } from '../../models/mobileBeehiveEnquiry.js'
import { WebhookController } from './webhook-controller.js'

/**
 * Encapsulates a controller.
 */
export class MobileBeehiveController {
  /**
   * Fetches all the mobile beehive enquiries from the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/mobile-beehive-enquiry
  async getAllMobileBeehiveEnquiries (req, res, next) {
    try {
      // Get all the mobile beehive enquiries from the database
      const mobileBeehiveEnquiries = await MobileBeehiveEnquiry.find()

      // Create an object with only the information needed
      const mobileBeehiveEnquiriesResponse = mobileBeehiveEnquiries.map(mobileBeehiveEnquiry => {
        return {
          location: mobileBeehiveEnquiry.location,
          startDate: mobileBeehiveEnquiry.startDate,
          endDate: mobileBeehiveEnquiry.endDate,
          requestedById: mobileBeehiveEnquiry.requestedById
        }
      })

      // Respond with the mobile beehive enquiries and hateoas links
      res.status(200).json({
        data: mobileBeehiveEnquiriesResponse,
        links: [
          createLink('/mobile-beehive-enquiry', 'mobile-beehive-enquiry', 'POST')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Adds a new mobile beehive enquiry to the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/mobile-beehive-enquiry
  async addMobileBeehiveEnquiry (req, res, next) {
    try {
      // Extract information from the request body
      const { location, startDate, endDate, requestedById } = req.body

      // Validate the data as needed (e.g., check for missing fields)
      // This is a simple example. Consider more thorough validation for production.
      // ^^ Change this validation maybe...?
      if (!location || !startDate || !endDate || !requestedById) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Create a new mobile beehive enquiry
      const newMobileBeehiveEnquiry = new MobileBeehiveEnquiry({
        location,
        startDate,
        endDate,
        requestedById
      })

      // Save the mobile beehive enquiry to the database
      const savedMobileBeehiveEnquiry = await newMobileBeehiveEnquiry.save()

      // Respond with the saved mobile beehive enquiry and hateoas links
      res.status(201).json({
        data: savedMobileBeehiveEnquiry,
        links: [
          createLink('/mobile-beehive-enquiry', 'mobile-beehive-enquiry', 'GET')
        ]
      })

      // After sending the response, trigger the webhooks
      // No need to await this function as we don't need to wait for it to finish
      WebhookController.triggerWebhooks('addedHiveEnquiry', savedMobileBeehiveEnquiry)
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error)
    }
  }
}
