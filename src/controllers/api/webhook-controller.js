/**
 * Module for the WebhookController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { Webhook } from './../../models/webhook.js'
// import createError from 'http-errors'
// import { createLink } from './../../utils/linkUtils.js'

/**
 * Encapsulates a controller.
 */
export class WebhookController {
  /**
   * Registers a webhook URL.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/webhook/register
  async registerWebhook (req, res, next) {
    try {
      const { url, events } = req.body

      if (!url || !events) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Store the webhook in the database
      const webhook = new Webhook({
        url,
        events
      })
      await webhook.save()

      // ^^ Can I include any hateoas links here?
      res.status(201).json({ message: 'Webhook registered successfully' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Triggers webhooks for a given event.
   *
   * @param {string} event - The event to trigger webhooks for.
   * @param {object} data - The data to send to the webhooks.
   */
  // Static method because then we don't need to create an instance of the controller to use it.
  static async triggerWebhooks (event, data) {
    try {
      // Find all webhooks that are registered for the given event
      const webhooks = await Webhook.find({ events: event })

      webhooks.forEach(webhook => {
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            // ^^ Is it okay to not return anything here? If the response is not okay or if an error occurs, it will be caught anyway
            // return response.json()
          })
          .catch(error => {
            console.error(`Error triggering webhook: ${error.message}`)
          })
      })
    } catch (error) {
      console.error(`Failed to trigger webhooks for event ${event}: ${error.message}`)
    }
  }
}
