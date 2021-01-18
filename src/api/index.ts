import { version } from '../../package.json'
import { Router } from 'express'

/**Types */
import { Auth } from '../auth'
import { S3 } from 'aws-sdk'

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
	api.post('/upload', (req, res) => {
		const upload = multer({
			storage: multer.diskStorage({
				destination: './temp',
				filename: (req, file, callback) => {
					callback(null, file.originalname)
				},
			}),
		}).single('uploadFile')

		// @types/multerの型定義がかなり胡散臭いのでやむなし。。
		// @ts-ignore
		upload(req, res, (err) => {
			if (err) res.status(500).send({ message: 'Error uploading file.' })

			const fileContent = fs.readFileSync(path.resolve(req.file.path))
			const params: S3.Types.PutObjectRequest = {
				Bucket: process.env.BUCKET as string,
				Key: req.file.filename,
				Body: fileContent,
			}
			s3.upload(params, (err, data) => {
				if (err) throw err
				res.status(200).send({ url: data.Location })
			})
		})
	})

	return api
}
