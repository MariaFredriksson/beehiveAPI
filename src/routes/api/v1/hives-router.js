/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 2.0.0
 */

import express from 'express'
// import { router as resourcesRouter } from './resources-router.js'
import { HivesController } from './../../../controllers/api/hives-controller.js'

export const router = express.Router()

const controller = new HivesController()

// GET tasks
// router.get('/', (req, res, next) => controller.getAll(req, res, next))

// GET hives/:id
router.get('/:id', (req, res, next) => controller.getHiveStatus(req, res, next))
