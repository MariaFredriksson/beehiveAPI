/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 2.0.0
 */

import express from 'express'
// import { router as resourcesRouter } from './resources-router.js'
import { router as hivesRouter } from './hives-router.js'
import { router as harvestRouter } from './harvest-router.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to the Beehive Monitoring API!' }))
router.use('/hives', hivesRouter)
router.use('/harvest', harvestRouter)
// router.use('/hives', resourcesRouter)
