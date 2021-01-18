import { version } from '../../package.json'
import { Router } from 'express'

/**Types */
import { Auth } from '../auth'

import fs from 'fs'
import path from 'path'
import multer from 'multer'

export default ({ client, s3 }: Auth) => {
	const api = Router()

	// perhaps expose some API metadata at the root
	api.get('/version', (req, res) => {
		res.json({ version })
	})

	// get project codes
	api.get('/records/:appid', (req, res, next) => {
		;(async () => {
			const params = {
				app: req.params.appid,
				fields: ['プロジェクトコード', 'プロジェクトネーム', '企業名'],
			}
			const records = await client.record.getRecords(params)
			res.status(200).json(records)
		})().catch(next)
	})

	// upload single-file to S3
	api.post('/upload', (req, res, next) => {
		console.log('received')
		const upload = multer({
			storage: multer.diskStorage({
				destination: './temp',
				filename: (req, file, callback) => {
					callback(null, file.originalname)
				},
			}),
		}).array('uploadFile', 1)

		upload(req, res, () => {
			console.log(req.files)
			res.status(200).send({ message: 'success' })
		})
	})

	return api
}
