/**
 * Mongoose model for Beehive User.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import isEmail from 'validator/lib/isEmail.js'

// Create a schema.
const beehiveUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Invalid email.']
  },
  password: {
    type: String,
    required: true,
    minLength: [10, 'The password must be of minimum length 10 characters.'],
    maxLength: [256, 'The password must be of maximum length 256 characters.']
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['IoTLabAdmin', 'farmer']
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

// The schema.virtual('id') line creates a virtual property id for the Mongoose schema. A virtual property is a property that is not stored in the database, but computed on the fly when you access it
beehiveUserSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Salts and hashes password before save
// Important that this is done before the model is created!
beehiveUserSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 8)
})

/**
 * Authenticates a user with the given `email` and `password`.
 *
 * @param {string} email - The email to search for.
 * @param {string} password - The password to verify.
 * @throws {Error} If no user was found with the given `email`, or if the password is incorrect.
 * @returns {object} The authenticated user.
 */
beehiveUserSchema.statics.authenticate = async function (email, password) {
  const beehiveUser = await this.findOne({ email })

  // If no user found or password is wrong, throw an error
  if (!beehiveUser || !(await bcrypt.compare(password, beehiveUser.password))) {
    throw new Error('Invalid login attempt')
  }

  // Else (if user was found and password was correct), return the user
  return beehiveUser
}

// Create a model using the schema.
export const BeehiveUser = mongoose.model('BeehiveUser', beehiveUserSchema)
