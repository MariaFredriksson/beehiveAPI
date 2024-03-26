/**
 * Module for the HivesController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { Resource } from './../../models/resource.js'
import { BeehiveFlow } from './../../models/beehiveFlow.js'
import { BeehiveHumidity } from './../../models/beehiveHumidity.js'
import { BeehiveTemperature } from './../../models/beehiveTemperature.js'
import { BeehiveWeight } from './../../models/beehiveWeight.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class HiveStatusController {
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
   * Fetches the most recent data from the specified model.
   *
   * @param {string} hiveId - The id of the hive to get the information about.
   * @param {object} model - The model to get the resource from.
   * @param {string} dataType - The type of data to get.
   * @returns {object} - The most recent data from the specified model.
   */
  #getMostRecent = async (hiveId, model, dataType) => {
    const databaseResponse = await model.findOne({ hiveId }).sort({ date: -1 })

    // Create a new object and only add the values that are needed
    const response = {
      hiveId: databaseResponse.hiveId,
      date: databaseResponse.date,
      // Using bracket notation to dynamically access property based on dataType
      [dataType]: databaseResponse[dataType]
    }

    return response
  }

  /**
   * Fetches the data within the specified timeframe from the specified model.
   *
   * @param {object} model - The model to get the resource from.
   * @param {string} dataType - The type of data to get.
   * @param {string} hiveId - The id of the hive to get the information about.
   * @param {string} startDate - The start date of the timeframe.
   * @param {string} endDate - The end date of the timeframe.
   * @returns {object} - The data within the specified timeframe from the specified model.
   */
  async #getDataWithinTimeframe (model, dataType, hiveId, startDate, endDate) {
    // Get the data from the database
    const data = await model.find({
      hiveId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 }) // Sorting by date ascending

    // Formatting the response
    const response = data.map(item => ({
      hiveId: item.hiveId,
      date: item.date,
      // Using bracket notation to dynamically access property based on dataType
      [dataType]: item[dataType]
    }))

    return response
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
   * Sends a JSON response containing the most recent flow, humidity, temperature and weight objects of a hive.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id
  async getHiveStatus (req, res, next) {
    try {
      const id = req.params.id

      const flowObject = await this.#getMostRecent(id, BeehiveFlow)

      const humidityObject = await this.#getMostRecent(id, BeehiveHumidity)

      const temperatureObject = await this.#getMostRecent(id, BeehiveTemperature)

      const weightObject = await this.#getMostRecent(id, BeehiveWeight)

      // Initialize the hiveResponse object with the hiveId
      const hiveResponse = { hiveId: id }

      // Only add the properties to hiveResponse if the relevant object is not null
      if (flowObject) hiveResponse.flow = flowObject.flow
      if (humidityObject) hiveResponse.humidity = humidityObject.humidity
      if (temperatureObject) hiveResponse.temperature = temperatureObject.temperature
      if (weightObject) hiveResponse.weight = weightObject.weight

      // ^^ Maybe change to this later
      // Create a new object and only add the values that are needed
      // const hiveResponse = {
      //   hiveId: idToGet,
      //   flow: flowObject.flow,
      //   humidity: humidityObject.humidity,
      //   temperature: temperatureObject.temperature,
      //   weight: weightObject.weight
      // }

      // Send the response to the client
      // No need to send the status code here, since it is automatically set to 200
      res.json(hiveResponse)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing the most recent flow object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/flow
  async getRecentFlow (req, res, next) {
    try {
      const id = req.params.id

      const flowObject = await this.#getMostRecent(id, BeehiveFlow)

      // Create a new object and only add the values that are needed
      const flowResponse = {
        hiveId: flowObject.hiveId,
        date: flowObject.date,
        flow: flowObject.flow
      }

      res.json(flowResponse)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing the most recent humidity object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/humidity
  async getHumidity (req, res, next) {
    try {
      const id = req.params.id

      const { startDate, endDate } = req.query

      let humidityResponse = {}

      if (!startDate || !endDate) {
        humidityResponse = await this.#getMostRecent(id, BeehiveHumidity, 'humidity')
      } else {
        humidityResponse = await this.#getDataWithinTimeframe(BeehiveHumidity, 'humidity', id, startDate, endDate)
      }

      res.json(humidityResponse)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing the most recent temperature object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/temperature
  async getRecentTemperature (req, res, next) {
    try {
      const id = req.params.id

      const temperatureObject = await this.#getMostRecent(id, BeehiveTemperature)

      // Create a new object and only add the values that are needed
      const temperatureResponse = {
        hiveId: temperatureObject.hiveId,
        date: temperatureObject.date,
        temperature: temperatureObject.temperature
      }

      res.json(temperatureResponse)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing the most recent weight object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/weight
  async getRecentWeight (req, res, next) {
    try {
      const id = req.params.id

      const weightObject = await this.#getMostRecent(id, BeehiveWeight)

      // Create a new object and only add the values that are needed
      const weightResponse = {
        hiveId: weightObject.hiveId,
        date: weightObject.date,
        weight: weightObject.weight
      }

      res.json(weightResponse)
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
