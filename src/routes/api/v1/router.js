/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { router as hivesRouter } from './hives-router.js'
import { router as harvestRouter } from './harvest-router.js'
import { router as mobileBeehiveRouter } from './mobile-beehive-router.js'
import { router as userRouter } from './user-router.js'
import { createLink } from './../../../utils/linkUtils.js'

export const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'Hooray! Welcome to the Beehive Monitoring API!',
    links: [
      createLink('/user/register', 'register', 'POST'),
      createLink('/user/login', 'login', 'POST'),
      createLink('/hives', 'get-all-hives', 'GET'),
      createLink('/hives', 'add-hive', 'POST'),
      createLink('/harvest', 'get-all-harvests', 'GET'),
      createLink('/harvest', 'add-harvest', 'POST'),
      createLink('/mobile-beehive-request', 'get-all-mobile-beehive-requests', 'GET'),
      createLink('/mobile-beehive-request', 'add-mobile-beehive-request', 'POST')
    ]
  })
})

router.use('/hives', hivesRouter)
router.use('/harvest', harvestRouter)
router.use('/mobile-beehive-request', mobileBeehiveRouter)
router.use('/user', userRouter)
