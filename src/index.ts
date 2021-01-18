import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import bodyParser from 'body-parser'

import { kintoneAuth, s3Auth } from './auth'

import middleware from './middleware'
import api from './api'
// TypeScriptはまだJSONの型を標準で提供してないのでファイル毎にimportする
import config from '../config.json'

/**HTTPS */
import https from 'https'
import fs from 'fs'
import path from 'path'

/**Types */
import { AddressInfo } from 'net'

const app = express()
const sslOptions = {
	key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
	cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')),
}

// logger
app.use(morgan('dev'))

// 3rd party middleware
app.use(
	cors({
		exposedHeaders: config.corsHeaders,
	})
)
app.use(
	bodyParser.json({
		type: 'application/*+json',
		limit: config.bodyLimit,
	})
)
app.use(
	bodyParser.urlencoded({
		extended: false,
		type: 'application/x-www-form-urlencoded',
	})
)

const serverSetup = async () => {
	// If authentication is required, add here
	const client = await kintoneAuth()
	const s3 = await s3Auth()

	// internal middleware
	app.use(middleware())

	// api router
	app.use('/api/v1', api({ client, s3 }))

	// HTTPS Server
	const server = https
		.createServer(sslOptions, app)
		.listen(process.env.PORT || config.port, () => {
			const host = server.address() as AddressInfo
			console.log(`Started on port ${host.port}`)
		})
	// HTTP Server
	// const server = app.listen(process.env.PORT || config.port, () => {
	// 	const host = server.address() as AddressInfo
	// 	console.log(`Started on port ${host.port}`)
	// })
}
serverSetup()

export default app
