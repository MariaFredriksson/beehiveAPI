import mongoose from 'mongoose'
import { parse } from 'csv-parse'
import fs from 'fs'
// import { BeehiveMetrics } from './../models/beehiveMetrics.js'
import { BeehiveFlow } from '../models/beehiveFlow.js'
import { connectDB } from '../config/mongoose.js'

// Connect to MongoDB
await connectDB()

// ! Change in config/mongoose when committing!!!
// ! So the import is done so the connections string is read from the env file again

/**
 * Inserts a batch of records into the database and clears the batch.
 *
 * @param {Array} batch - The batch of records to insert.
 * @returns {Promise} A promise that resolves when the batch has been inserted.
 */
const insertBatch = async (batch) => {
  if (batch.length === 0) {
    return // Skip if batch is empty
  }

  try {
    await BeehiveFlow.insertMany(batch)
    console.log(`Inserted batch of ${batch.length} records.`)
  } catch (err) {
    console.error('Error inserting batch:', err)
  }
}

/**
 * Parses a CSV file and inserts the data into MongoDB.
 *
 * @param {string} filePath - The path to the CSV file.
 * @param {number} batchSize - The number of records to insert in each batch. Default is 500.
 */
const importDataFromCSV = (filePath, batchSize = 500) => {
  const records = [] // Array to hold the parsed records

  fs.createReadStream(filePath)
    .pipe(parse({
      columns: true, // Assumes the first line of your CSV file contains column names
      skip_empty_lines: true
    }))
    .on('data', async (csvRow) => {
      const record = {
        hiveId: 0, // & Change this when importing the next CSV file
        date: new Date(csvRow.timestamp),
        flow: parseInt(csvRow.flow)
      }
      records.push(record) // Add record to the current batch

      // If the batch size is reached, insert the batch and clear the records array
      if (records.length >= batchSize) {
        // Wait for the batch to be inserted before continuing
        await insertBatch(records.splice(0, records.length)) // Clears the records array after inserting
      }
    })
    .on('end', async () => {
      // Insert any remaining records
      await insertBatch(records)
      console.log('Data successfully imported to MongoDB Atlas')
      mongoose.disconnect()
    })
    .on('error', err => {
      console.error('Error processing CSV file:', err)
      mongoose.disconnect()
    })
}

// Replace 'path/to/your/csvfile.csv' with the path to your CSV file
importDataFromCSV('./../beehive_data/flow_2017.csv')
