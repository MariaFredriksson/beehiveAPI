/**
 * Mongoose model Resource.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import validator from 'validator'

// Create a schema.
const schema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true,
    validate: {
      /**
       * Validates that the value is a valid URL.
       *
       * @param {string} value - The value to validate.
       * @returns {boolean} True if the value is a valid URL, otherwise false.
       */
      validator: function (value) {
        return validator.isURL(value, { require_protocol: true })
      },
      message: 'Invalid URL format for imageUrl'
    }
  },
  contentType: {
    type: String,
    // These are the only allowed values for the contentType property
    enum: ['image/gif', 'image/jpeg', 'image/png'],
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String
  }
}, {
  // Automatically adds timestamps (createdAt and updatedAt) to each document.
  timestamps: true,
  toJSON: {
    // By setting the virtuals property to true, you can ensure that the id virtual field is included in the object representation of the Mongoose document, even though it is not stored in the database.
    virtuals: true, // ensure virtual fields are serialized
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
export const Resource = mongoose.model('Resource', schema)
