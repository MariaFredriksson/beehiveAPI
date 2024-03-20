/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @author Mats Loock
 * @version 2.0.0
 */

import express from 'express'
import { router as resourcesRouter } from './resources-router.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this resourceful RESTful API!' }))
router.use('/images', resourcesRouter)
