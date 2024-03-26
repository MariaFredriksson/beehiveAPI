/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { MobileBeehiveController } from './../../../controllers/api/mobile-beehive-controller.js'
// import { HarvestController } from './../../../controllers/api/harvest-controller.js'

export const router = express.Router()

const controller = new MobileBeehiveController()
// const controller = new HarvestController()

// GET mobile beehive requests
router.get('/', (req, res, next) => controller.getAllMobileBeehiveRequests(req, res, next))

// POST mobile beehive request
router.post('/', (req, res, next) => controller.addMobileBeehiveRequest(req, res, next))

// GET harvests
// router.get('/', (req, res, next) => controller.getAllHarvests(req, res, next))

// POST harvest
// router.post('/', (req, res, next) => controller.addHarvest(req, res, next))