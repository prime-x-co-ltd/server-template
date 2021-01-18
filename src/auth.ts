import { KintoneRestAPIClient } from '@kintone/rest-api-client'
import * as AWS from 'aws-sdk'
import * as dotenv from 'dotenv'
dotenv.config()

// Types
export type Auth = {
	client: KintoneRestAPIClient
	s3: AWS.S3
}

export const kintoneAuth = async () => {
	const client = await new KintoneRestAPIClient({
		baseUrl: process.env.KINTONEURL,
		auth: {
			username: process.env.KINTONEUSER,
			password: process.env.KINTONEPSWD,
		},
	})
	return Promise.resolve(client)
}

export const s3Auth = async () => {
	const s3 = await new AWS.S3({
		signatureVersion: 'v4',
		accessKeyId: process.env.ACCESSKEYID,
		secretAccessKey: process.env.SECRETACCESSKEY,
		region: process.env.REGION,
	})
	return Promise.resolve(s3)
}
