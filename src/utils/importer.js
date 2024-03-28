import mongoose from 'mongoose'
import { parse } from 'csv-parse'
import fs from 'fs'
import { BeehiveFlow } from '../models/beehiveFlow.js'
import { BeehiveHumidity } from '../models/beehiveHumidity.js'
import { BeehiveTemperature } from '../models/beehiveTemperature.js'
import { BeehiveWeight } from './../models/beehiveWeight.js'
import { connectDB } from '../config/mongoose.js'

// & Run with node --inspect -r dotenv/config src/utils/importer.js

/**
 * Returns the Mongoose model for the specified data type.
 *
 * @param {string} dataType - The type of data to import (e.g. 'flow', 'humidity', etc.).
 * @returns {Model} The Mongoose model for the specified data type.
 */
const getModelForDataType = (dataType) => {
  switch (dataType) {
    case 'flow':
      return BeehiveFlow
    case 'humidity':
      return BeehiveHumidity
    case 'temperature':
      return BeehiveTemperature
    case 'weight':
      return BeehiveWeight
    // Add cases for other data types/models
    default:
      throw new Error(`Unknown data type: ${dataType}`)
  }
}

/**
 * Validates the value based on the data type.
 *
 * @param {string} dataType - The type of data being imported.
 * @param {number} value - The value to validate.
 * @returns {boolean} True if the value is valid, false otherwise.
 */
const isValidValue = (dataType, value) => {
  switch (dataType) {
    case 'flow':
    case 'temperature':
      return true // No specific checks for flow and temperature
    case 'weight':
      return value >= 0 // Weight must be 0 or more
    case 'humidity':
      return value >= 0 && value <= 100 // Humidity must be between 0 and 100
    default:
      return false // Unknown data type
  }
}

/**
 * Inserts a batch of records into the database and clears the batch.
 *
 * @param {Array} batch - The batch of records to insert.
 * @param {Model} Model - The Mongoose model to insert the records into.
 */
const insertBatch = async (batch, Model) => {
  if (batch.length > 0) {
    try {
      // Attempt to insert the whole batch initially
      await Model.insertMany(batch, { ordered: false })
      console.log(`Inserted batch of ${batch.length} records.`)
    } catch (err) {
      console.error('Error inserting batch. Skipping batch.')
      console.error(err.message)

      // ^^ Is there any way that I can go through the batch and insert the records that are valid, and skip the invalid ones?
      // throw new Error(err)

      // console.error('Error inserting batch. Processing documents individually to skip invalid ones.')
      // // Process each document individually if there's an error
      // const validDocuments = []

      // for (const doc of batch) {
      //   const document = new Model(doc)
      //   try {
      //     await document.validate()
      //     validDocuments.push(doc)
      //   } catch (err) {
      //     console.error(`Validation failed for document: ${err.message}`)
      //     // Skip invalid document
      //   }
      // }

      // if (validDocuments.length > 0) {
      //   try {
      //     await Model.insertMany(validDocuments, { ordered: false })
      //     console.log(`Inserted batch of ${validDocuments.length} validated records.`)
      //   } catch (err) {
      //     console.error('Error inserting batch:', err)
      //   }
      // }
    }
  }
}

/**
 * Parses a CSV file and inserts the data into MongoDB.
 *
 * @param {string} filePath - The path to the CSV file.
 * @param {number} hiveId - The ID of the beehive to import data for.
 * @param {string} dataType - The type of data to import (e.g. 'flow', 'humidity', etc.).
 * @param {number} batchSize - The number of records to insert in each batch. Default is 500.
 * @param {number} skipInterval - The interval at which to skip rows. For example, 3 means every third row is processed. Default is 1.
 */
const importDataFromCSV = (filePath, hiveId, dataType, batchSize = 500, skipInterval = 1) => {
  let rowCount = 0 // Counter to keep track of the current row
  const records = [] // Array to hold the parsed records
  const model = getModelForDataType(dataType) // Get the appropriate model

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true, // Assumes the first line of your CSV file contains column names
        skip_empty_lines: true
      }))
      .on('data', async (csvRow) => {
        rowCount++
        // Only process rows based on the skipInterval
        if (rowCount % skipInterval === 0) {
          const value = parseFloat(csvRow[dataType]) // Convert value from CSV to float

          // Validate the value based on dataType
          if (!isNaN(value) && isValidValue(dataType, value)) {
            const record = {
              hiveId,
              date: new Date(csvRow.timestamp),
              [dataType]: value
            }

            records.push(record) // Add record to the current batch
          }
        }

        // If the batch size is reached, insert the batch and clear the records array
        if (records.length >= batchSize) {
          // try {
          //   await insertBatch(records, model) // Inserts the batch of records
          //   // Clear the records array after inserting
          //   records.splice(0, records.length)
          // } catch (error) {
          //   console.log('Fel fel fel')
          // }

          // Wait for the batch to be inserted before continuing
          await insertBatch(records.splice(0, records.length), model) // Clears the records array after inserting
        }
      })
      .on('end', async () => {
        // Insert any remaining records
        await insertBatch(records)
        resolve() // Resolve the promise after all inserts are done
        // console.log('Data successfully imported to MongoDB Atlas')
        // mongoose.disconnect()
      })
      .on('error', err => {
        console.error('Error processing CSV file:', err)
        reject(err) // Reject the promise if an error occurs
        // mongoose.disconnect()
      })
  })
}

// & Run with node --inspect -r dotenv/config src/utils/importer.js

// Connect to MongoDB
await connectDB()

// & Upload data from all the files, or comment out the ones you don't want to upload
// importDataFromCSV('./../beehive_data/flow_schwartau.csv', 0, 'flow', 500, 20)
// importDataFromCSV('./../beehive_data/flow_wurzburg.csv', 1, 'flow', 500, 20)
// importDataFromCSV('./../beehive_data/humidity_schwartau.csv', 0, 'humidity', 10)
// importDataFromCSV('./../beehive_data/humidity_wurzburg.csv', 1, 'humidity')
// importDataFromCSV('./../beehive_data/temperature_schwartau.csv', 0, 'temperature', 500, 2)
// importDataFromCSV('./../beehive_data/temperature_wurzburg.csv', 1, 'temperature', 500, 8)
importDataFromCSV('./../beehive_data/weight_schwartau.csv', 0, 'weight', 10, 5)
// importDataFromCSV('./../beehive_data/weight_wurzburg.csv', 1, 'weight', 500, 10)
  .then(() => {
    console.log('Data successfully imported to MongoDB Atlas')
    mongoose.disconnect()
  })
  .catch((err) => {
    console.error('Error importing data:', err)
    mongoose.disconnect()
  })
