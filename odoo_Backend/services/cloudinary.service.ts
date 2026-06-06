import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/environment.js';
import { Logger } from '../helpers/logger.helper.js';

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Uploads a local file to Cloudinary
   */
  public static async uploadFile(filePath: string, folder: string = 'pms'): Promise<string> {
    try {
      Logger.info(`Uploading file ${filePath} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
      });
      Logger.info(`Cloudinary upload success: ${result.secure_url}`);
      return result.secure_url;
    } catch (error) {
      Logger.error(`Cloudinary upload error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Uploads a Buffer to Cloudinary
   */
  public static async uploadBuffer(buffer: Buffer, fileName: string, folder: string = 'pms'): Promise<string> {
    return new Promise((resolve, reject) => {
      Logger.info(`Uploading buffer for ${fileName} to Cloudinary...`);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: fileName.replace(/\.[^/.]+$/, ""), // remove extension
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            Logger.error(`Cloudinary buffer upload error: ${error.message}`);
            return reject(error);
          }
          Logger.info(`Cloudinary buffer upload success: ${result?.secure_url}`);
          resolve(result!.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }
}
