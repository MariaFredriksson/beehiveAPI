/**
 * Mongoose model for Beehive humidity.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const beehiveHumiditySchema = new mongoose.Schema({
  hiveId: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100 // Humidity percentage
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
export const BeehiveHumidity = mongoose.model('BeehiveHumidity', beehiveHumiditySchema)
