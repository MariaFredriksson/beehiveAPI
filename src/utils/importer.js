import mongoose from 'mongoose'
import { parse } from 'csv-parse'
import fs from 'fs'
import { BeehiveMetrics } from './../models/beehiveMetrics.js'
import { connectDB } from '../config/mongoose.js'

// Connect to MongoDB
await connectDB()

// ! Change in config/mongoose when committing!!!
// ! So the import is done so the connections string is read from the env file again

/**
 * Parses a CSV file and inserts the data into MongoDB.
 *
 * @param {string} filePath - The path to the CSV file.
 */
const importDataFromCSV = (filePath) => {
  const records = [] // Array to hold the parsed records

  fs.createReadStream(filePath)
    .pipe(parse({
      columns: true, // Assumes the first line of your CSV file contains column names
      skip_empty_lines: true
    }))
    .on('data', (csvRow) => {
      const record = {
        hiveId: 0, // & Change this when importing the next CSV file
        date: new Date(csvRow.timestamp),
        flow: parseInt(csvRow.flow)
      }
      records.push(record) // Adjust mapping as necessary based on your CSV structure and model
    })
    .on('end', () => {
      BeehiveMetrics.insertMany(records)
        .then(() => {
          console.log('Data successfully imported to MongoDB Atlas')
          mongoose.disconnect()
        })
        .catch(err => {
          console.error('Error inserting data:', err)
          mongoose.disconnect()
        })
    })
}

// Replace 'path/to/your/csvfile.csv' with the path to your CSV file
importDataFromCSV('./../beehive_data/flow_2017.csv')
