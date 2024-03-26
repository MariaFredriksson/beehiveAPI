/**
 * Module for the HiveStatusController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { Beehive } from './../../models/beehive.js'
import { createLink } from './../../utils/linkUtils.js'
import { BeehiveFlow } from './../../models/beehiveFlow.js'
import { BeehiveHumidity } from './../../models/beehiveHumidity.js'
import { BeehiveTemperature } from './../../models/beehiveTemperature.js'
import { BeehiveWeight } from './../../models/beehiveWeight.js'

/**
 * Encapsulates a controller.
 */
export class HiveStatusController {
  /**
   * Fetches the most recent data from the specified model.
   *
   * @param {string} hiveId - The id of the hive to get the information about.
   * @param {object} model - The model to get the resource from.
   * @param {string} dataType - The type of data to get.
   * @returns {object} - The most recent data from the specified model, or null if there is no data.
   */
  #getMostRecent = async (hiveId, model, dataType) => {
    // ^^ Maybe fix so that it can return more data, if the data is registered at the same time?
    const databaseResponse = await model.findOne({ hiveId }).sort({ date: -1 })

    if (!databaseResponse) {
      return null
    }

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

      const hiveInfo = await Beehive.findOne({ hiveId: id })

      const flowObject = await this.#getMostRecent(id, BeehiveFlow, 'flow')
      const humidityObject = await this.#getMostRecent(id, BeehiveHumidity, 'humidity')
      const temperatureObject = await this.#getMostRecent(id, BeehiveTemperature, 'temperature')
      const weightObject = await this.#getMostRecent(id, BeehiveWeight, 'weight')

      // Initialize the hiveResponse object with the hiveId
      const hiveResponse = { hiveId: id }

      // ^^ Maybe change so that one can get more data if the data is registered at the same time?
      // ^^ And maybe also get the date for the data?
      // Only add the properties to hiveResponse if the relevant object is not null
      if (hiveInfo) hiveResponse.location = hiveInfo.location
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

      // Send the response to the client and hateoas links
      // No need to send the status code here, since it is automatically set to 200
      res.json({
        data: hiveResponse,
        links: [
          createLink(`/hives/${id}/flow`, 'hive-flow', 'GET'),
          createLink(`/hives/${id}/humidity`, 'hive-humidity', 'GET'),
          createLink(`/hives/${id}/temperature`, 'hive-temperature', 'GET'),
          createLink(`/hives/${id}/weight`, 'hive-weight', 'GET'),
          createLink('/hives', 'get-all-hives', 'GET')
        ]
      })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  /**
   * Sends a JSON response containing flow object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/flow
  async getFlow (req, res, next) {
    try {
      const id = req.params.id

      const { startDate, endDate } = req.query

      let flowResponse = {}

      if (!startDate || !endDate) {
        flowResponse = await this.#getMostRecent(id, BeehiveFlow, 'flow')
      } else {
        flowResponse = await this.#getDataWithinTimeframe(BeehiveFlow, 'flow', id, startDate, endDate)
      }

      res.json({
        data: flowResponse,
        links: [
          createLink(`/hives/${id}`, 'get-hive-status', 'GET'),
          createLink(`/hives/${id}/humidity`, 'hive-humidity', 'GET'),
          createLink(`/hives/${id}/temperature`, 'hive-temperature', 'GET'),
          createLink(`/hives/${id}/weight`, 'hive-weight', 'GET'),
          createLink('/hives', 'get-all-hives', 'GET')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing humidity object.
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

      res.json({
        data: humidityResponse,
        links: [
          createLink(`/hives/${id}`, 'get-hive-status', 'GET'),
          createLink(`/hives/${id}/flow`, 'hive-flow', 'GET'),
          createLink(`/hives/${id}/temperature`, 'hive-temperature', 'GET'),
          createLink(`/hives/${id}/weight`, 'hive-weight', 'GET'),
          createLink('/hives', 'get-all-hives', 'GET')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing temperature object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/temperature
  async getTemperature (req, res, next) {
    try {
      const id = req.params.id

      const { startDate, endDate } = req.query

      let temperatureResponse = {}

      if (!startDate || !endDate) {
        temperatureResponse = await this.#getMostRecent(id, BeehiveTemperature, 'temperature')
      } else {
        temperatureResponse = await this.#getDataWithinTimeframe(BeehiveTemperature, 'temperature', id, startDate, endDate)
      }

      res.json({
        data: temperatureResponse,
        links: [
          createLink(`/hives/${id}`, 'get-hive-status', 'GET'),
          createLink(`/hives/${id}/flow`, 'hive-flow', 'GET'),
          createLink(`/hives/${id}/humidity`, 'hive-humidity', 'GET'),
          createLink(`/hives/${id}/weight`, 'hive-weight', 'GET'),
          createLink('/hives', 'get-all-hives', 'GET')
        ]
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing weight object.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // * This is called by doing a GET to http://localhost:5030/api/v1/hives/:id/weight
  async getWeight (req, res, next) {
    try {
      const id = req.params.id

      const { startDate, endDate } = req.query

      let weightResponse = {}

      if (!startDate || !endDate) {
        weightResponse = await this.#getMostRecent(id, BeehiveWeight, 'weight')
      } else {
        weightResponse = await this.#getDataWithinTimeframe(BeehiveWeight, 'weight', id, startDate, endDate)
      }

      res.json({
        data: weightResponse,
        links: [
          createLink(`/hives/${id}`, 'get-hive-status', 'GET'),
          createLink(`/hives/${id}/flow`, 'hive-flow', 'GET'),
          createLink(`/hives/${id}/humidity`, 'hive-humidity', 'GET'),
          createLink(`/hives/${id}/temperature`, 'hive-temperature', 'GET'),
          createLink('/hives', 'get-all-hives', 'GET')
        ]
      })
    } catch (error) {
      next(error)
    }
  }
}
