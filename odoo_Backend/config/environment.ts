import dotenv from 'dotenv';
import path from 'path';
import joi from 'joi';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the appropriate env file
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = joi.object({
  PORT: joi.number().default(3000),
  NODE_ENV: joi.string().valid('development', 'production', 'test').default('development'),
  MONGO_URI: joi.string().required().description('MongoDB connection string'),
  JWT_SECRET: joi.string().required().description('JWT secret key'),
  JWT_EXPIRES_IN: joi.string().default('1d'),
  JWT_REFRESH_SECRET: joi.string().optional().default('refresh_secret_key'),
  JWT_REFRESH_EXPIRES_IN: joi.string().default('7d'),
  SMTP_HOST: joi.string().optional(),
  SMTP_PORT: joi.number().optional(),
  SMTP_USER: joi.string().optional(),
  SMTP_PASS: joi.string().optional(),
  EMAIL_FROM: joi.string().email().optional(),
  AWS_ACCESS_KEY_ID: joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: joi.string().optional(),
  AWS_REGION: joi.string().optional(),
  AWS_S3_BUCKET_NAME: joi.string().optional(),
  FRONTEND_URL: joi.string().optional().default('http://localhost:3000'),
  TAX_RATE: joi.number().optional().default(18),
  CLOUDINARY_CLOUD_NAME: joi.string().required(),
  CLOUDINARY_API_KEY: joi.string().required(),
  CLOUDINARY_API_SECRET: joi.string().required(),
}).unknown().required();

const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = {
  PORT: envVars.PORT,
  NODE_ENV: envVars.NODE_ENV,
  MONGO_URI: envVars.MONGO_URI,
  JWT_SECRET: envVars.JWT_SECRET,
  JWT_EXPIRES_IN: envVars.JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET: envVars.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: envVars.JWT_REFRESH_EXPIRES_IN,
  SMTP_HOST: envVars.SMTP_HOST,
  SMTP_PORT: envVars.SMTP_PORT,
  SMTP_USER: envVars.SMTP_USER,
  SMTP_PASS: envVars.SMTP_PASS,
  EMAIL_FROM: envVars.EMAIL_FROM,
  AWS_ACCESS_KEY_ID: envVars.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: envVars.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: envVars.AWS_REGION,
  AWS_S3_BUCKET_NAME: envVars.AWS_S3_BUCKET_NAME,
  FRONTEND_URL: envVars.FRONTEND_URL,
  TAX_RATE: envVars.TAX_RATE,
  CLOUDINARY_CLOUD_NAME: envVars.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: envVars.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: envVars.CLOUDINARY_API_SECRET,
};
export type Config = typeof config;
