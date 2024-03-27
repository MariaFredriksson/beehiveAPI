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

// GET mobile beehive requests
router.get('/', (req, res, next) => controller.getAllMobileBeehiveRequests(req, res, next))

// POST mobile beehive request
router.post('/', (req, res, next) => controller.addMobileBeehiveRequest(req, res, next))
