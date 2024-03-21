/**
 * Mongoose model for Beehive Metrics.
 *
 * This model is designed to store various types of data collected from beehives,
 * such as flow rates, humidity levels, temperature readings, and hive weights.
 * Each record is timestamped and associated with a specific location or hive identifier.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const beehiveMetricsSchema = new mongoose.Schema({
  hiveId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  flow: {
    type: Number,
    required: false // Assuming not all records will have every metric
  },
  humidity: {
    type: Number,
    required: false,
    min: 0,
    max: 100 // Humidity percentage
  },
  temperature: {
    type: Number,
    required: false
  },
  weight: {
    type: Number,
    required: false
  },
  location: {
    type: String,
    required: false
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  toJSON: {
    virtuals: true, // Ensure virtual fields are serialized
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    // Deletes _id and _v from the JSON. They exist in the database, but not in the code that we get back from the database
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    }
  }
})

// Create a model using the schema.
export const BeehiveMetrics = mongoose.model('BeehiveMetrics', beehiveMetricsSchema)
