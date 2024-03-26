/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 2.0.0
 */

import express from 'express'
// import { router as resourcesRouter } from './resources-router.js'
import { HivesController } from './../../../controllers/api/hives-controller.js'
import { HiveStatusController } from './../../../controllers/api/hive-status-controller.js'

export const router = express.Router()

const hivesController = new HivesController()
const statusController = new HiveStatusController()

// GET tasks
// router.get('/', (req, res, next) => controller.getAll(req, res, next))

// POST hives
router.post('/', (req, res, next) => hivesController.addHive(req, res, next))

// PUT hives/:id
router.put('/:id', (req, res, next) => hivesController.updateHive(req, res, next))

// GET hives/:id
router.get('/:id', (req, res, next) => statusController.getHiveStatus(req, res, next))

// GET hives/:id/flow
router.get('/:id/flow', (req, res, next) => statusController.getRecentFlow(req, res, next))

// GET hives/:id/humidity
router.get('/:id/humidity', (req, res, next) => statusController.getHumidity(req, res, next))

// GET hives/:id/temperature
router.get('/:id/temperature', (req, res, next) => statusController.getRecentTemperature(req, res, next))

// GET hives/:id/weight
router.get('/:id/weight', (req, res, next) => statusController.getRecentWeight(req, res, next))
