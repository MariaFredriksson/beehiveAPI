/**
 * Mongoose model for webhook requests.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import isURL from 'validator/lib/isURL.js'

// Create a schema.
const webhookSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      /**
       * Validates that the URL is a valid URL.
       *
       * @param {string} value - The URL to validate.
       * @returns {boolean} - Whether the URL is valid.
       */
      validator: function (value) {
        return isURL(value, {
          protocols: ['http', 'https'], // Require protocols to be specified
          require_protocol: true // Ensure the URL includes a protocol
        })
      },
      message: 'Invalid URL.'
    }
  },
  // The events that the webhook should listen to
  // If there will be more events in the future, we can add them here
  events: {
    type: [String],
    required: true,
    enum: ['addedHiveRequest']
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
export const Webhook = mongoose.model('Webhook', webhookSchema)
