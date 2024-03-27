/**
 * API version 1 routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { WebhookController } from './../../../controllers/api/webhook-controller.js'

export const router = express.Router()

const controller = new WebhookController()

// Register webhook
router.post('/register', (req, res, next) => controller.registerWebhook(req, res, next))
