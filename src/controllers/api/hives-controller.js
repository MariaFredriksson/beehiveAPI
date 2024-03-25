/**
 * Module for the TasksController.
 *
 * @author Maria Fredriksson
 * @version 2.0.0
 */

// import { Resource } from '../../models/resource.js'
import { BeehiveFlow } from './../../models/beehiveFlow.js'
import { BeehiveHumidity } from './../../models/beehiveHumidity.js'
import { BeehiveTemperature } from './../../models/beehiveTemperature.js'
import { BeehiveWeight } from './../../models/beehiveWeight.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class HivesController {
  /**
   * Fetches a resource from the provided url.
   * Will probably just work for POST, PUT, PATCH and DELETE methods, and not GET.
   *
   * @param {string} url - The url to fetch from.
   * @param {object} requestBody - The request body.
   * @param {string} methodToUse - The method to use.
   * @param {string} accepted - The accepted header.
   * @returns {Promise<object>} - The fetched resource.
   */
  #fetchPostPutPatchDel = async (url, requestBody, methodToUse, accepted) => {
    const response = await fetch(url, {
      method: methodToUse,
      headers: {
        accept: accepted,
        'X-API-Private-Token': process.env.PRIVATE_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: requestBody.data,
        contentType: requestBody.contentType
      })
    })

    if (!response.ok) {
      const error = await response.json()

      // This error will propagate to the place calling this method, and be caught in the catch there, so no need for try/catch here
      throw createError(response.status, error)
    }

    return response
  }

  /**
   * Updates a resource in the database.
   *
   * @param {string} idToUpdate - The id of the resource to update.
   * @param {object} requestBody - The request body.
   */
  #updateOneInDB = async (idToUpdate, requestBody) => {
    try {
      // Find the resource to update by id, and then update it
      await Resource.findOneAndUpdate({ id: idToUpdate }, {
        data: requestBody.data,
        contentType: requestBody.contentType,
        description: requestBody.description,
        location: requestBody.location
      }, { runValidators: true })
    } catch (error) {
      // This error will propagate to the place calling this method
      throw createError(500, error)
    }
  }

  /**
   * Sends a JSON response containing all resources.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives
  async getAll (req, res, next) {
    try {
      // Get all hives from the database
      const hives = await Resource.find()

      // Send the response to the client
      // No need to send the status code here, since it is automatically set to 200
      res.json(hives)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing one resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id
  async getHiveStatus (req, res, next) {
    try {
      // ^^ Just send some test response for now
      res.status(200).json({ message: 'This is a test response' })

      // const idToGet = req.params.id

      // Get the latest weight from the database for the hive
      // const weight = await BeehiveWeight.findOne({ hiveId: idToGet }).sort({ timestamp: -1 })

      // Get the image from the database
      // const image = await Resource.findOne({ id: idToGet })

      // Send the response to the client
      // No need to send the status code here, since it is automatically set to 200
      // res.json(weight)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new resource and saves it in the database.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a POST to http://localhost:5030/api/v1/hives
  async create (req, res, next) {
    let newImage = {}
    try {
      const newImageJson = await this.#fetchPostPutPatchDel('https://courselab.lnu.se/picture-it/images/api/v1/hives', req.body, 'POST', 'application/json')
      newImage = await newImageJson.json()
      // If data and contentType is not included in the request body, or isn't correct, the image service will return an error.
      // These are the same things that are required in the database (plus the imageUrl returned from the image service) so if the req.body is good enough for the image service, it is good enough for the database.

      // Save the image in the database
      const resource = new Resource({
        id: newImage.id,
        imageUrl: newImage.imageUrl,
        contentType: newImage.contentType,
        description: req.body.description,
        location: req.body.location
      })

      await resource.save()

      // Since the model says to delete _id and __v in a JSON, these values are not sent to the client, but exists when it is just an object
      res.status(201).json(resource)
    } catch (error) {
      // If an error occurs, it might be because the image could not be saved in the database, so then try to delete it from the image api
      try {
        await this.#fetchPostPutPatchDel(`https://courselab.lnu.se/picture-it/images/api/v1/hives/${newImage.id}`, req.body, 'DELETE', '*/*')
      } catch (error) {
        // If an error occurs here, just ignore it
      }

      next(error)
    }
  }

  /**
   * Updates a resource partially.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a PATCH to http://localhost:5030/api/v1/hives/:id
  async updatePartially (req, res, next) {
    try {
      const id = req.params.id

      // Only fetch the image API if there is new information that the image service is interested in
      if (req.body.data || req.body.contentType) {
        // Do a fetch PATCH to the image api
        await this.#fetchPostPutPatchDel(`https://courselab.lnu.se/picture-it/images/api/v1/hives/${id}`, req.body, 'PATCH', '*/*')
        // If data or contentType isn't correct, the image service will return an error.
        // These are the same things that are required in the database (plus the imageUrl returned from the image service) so if the req.body is good enough for the image service, it is good enough for the database.
      }

      // Update the image in the database
      await this.#updateOneInDB(id, req.body)

      // ^^ What if the database can't be updated, but the image api can? Can I undo in the image api then?

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates one whole resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a PUT to http://localhost:5030/api/v1/hives/:id
  async updateWhole (req, res, next) {
    try {
      const id = req.params.id

      await this.#fetchPostPutPatchDel(`https://courselab.lnu.se/picture-it/images/api/v1/hives/${id}`, req.body, 'PUT', '*/*')
      // If data and contentType is not included in the request body, or isn't correct, the image service will return an error.
      // These are the same things that are required in the database, so if the req.body is good enough for the image service, it is good enough for the database.

      // Update the image in the database
      await this.#updateOneInDB(id, req.body)

      // ^^ What if the database can't be updated, but the image api can? Can I undo in the image api then?

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes one resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a DELETE to http://localhost:5030/api/v1/hives/:id
  async delete (req, res, next) {
    try {
      const idToDelete = req.params.id

      // Do a fetch DELETE to the image api
      // Just send an empty object as the request body since null doesn't work
      await this.#fetchPostPutPatchDel(`https://courselab.lnu.se/picture-it/images/api/v1/hives/${idToDelete}`, {}, 'DELETE', '*/*')

      // Delete the resource in the database
      await Resource.deleteOne({ id: idToDelete })

      // ^^ What if the resource can't be deleted from the database?

      // Only send a 204 status code to the client
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }
}
