/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { MobileBeehiveController } from './../../../controllers/api/mobile-beehive-controller.js'

export const router = express.Router()

const controller = new MobileBeehiveController()

// GET mobile beehive enquiries
router.get('/', (req, res, next) => controller.getAllMobileBeehiveEnquiries(req, res, next))

// POST mobile beehive enquiry
router.post('/', (req, res, next) => controller.addMobileBeehiveEnquiry(req, res, next))
