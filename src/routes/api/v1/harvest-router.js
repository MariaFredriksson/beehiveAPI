/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { HarvestController } from './../../../controllers/api/harvest-controller.js'

export const router = express.Router()

const controller = new HarvestController()

// GET harvests
router.get('/', (req, res, next) => controller.getAllHarvests(req, res, next))

// POST harvest
router.post('/', (req, res, next) => controller.addHarvest(req, res, next))
