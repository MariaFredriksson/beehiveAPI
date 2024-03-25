/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 2.0.0
 */

import express from 'express'
// import { router as resourcesRouter } from './resources-router.js'
// import { HivesController } from './../../../controllers/api/hives-controller.js'
import { HarvestController } from './../../../controllers/api/harvest-controller.js'

export const router = express.Router()

// const controller = new HivesController()
const controller = new HarvestController()

// POST harvest
router.post('/', (req, res, next) => controller.addHarvest(req, res, next))

// GET tasks
// router.get('/', (req, res, next) => controller.getAll(req, res, next))

// // GET hives/:id
// router.get('/:id', (req, res, next) => controller.getHiveStatus(req, res, next))

// // GET hives/:id/flow
// router.get('/:id/flow', (req, res, next) => controller.getRecentFlow(req, res, next))

// // GET hives/:id/humidity
// router.get('/:id/humidity', (req, res, next) => controller.getRecentHumidity(req, res, next))

// // GET hives/:id/temperature
// router.get('/:id/temperature', (req, res, next) => controller.getRecentTemperature(req, res, next))

// // GET hives/:id/weight
// router.get('/:id/weight', (req, res, next) => controller.getRecentWeight(req, res, next))
