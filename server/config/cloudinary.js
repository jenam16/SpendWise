import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Upload receipt buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - File mimetype
 * @returns {Promise<{ publicId: string, secureUrl: string, originalName: string, mimeType: string, uploadedAt: Date }>}
 */
export const uploadReceipt = async (buffer, originalName, mimeType) => {
  if (!isCloudinaryConfigured) {
    console.warn(
      '⚠️ [Cloudinary Notice] CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not configured in .env. Using simulated receipt storage for development.'
    )
    const base64 = buffer.toString('base64')
    const simulatedUrl = `data:${mimeType};base64,${base64}`
    const publicId = `simulated_receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    return {
      publicId,
      secureUrl: simulatedUrl,
      originalName: originalName || 'receipt',
      mimeType: mimeType || 'image/jpeg',
      uploadedAt: new Date(),
    }
  }

  return new Promise((resolve, reject) => {
    const isPdf = mimeType === 'application/pdf'
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'spendwise/receipts',
        resource_type: isPdf ? 'raw' : 'auto',
        public_id: `receipt_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(error.message || 'Cloudinary upload failed'))
        }
        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          originalName: originalName || 'receipt',
          mimeType: mimeType || 'image/jpeg',
          uploadedAt: new Date(),
        })
      }
    )

    uploadStream.end(buffer)
  })
}

/**
 * Delete receipt from Cloudinary
 * @param {string} publicId - Cloudinary asset public ID
 */
export const deleteReceipt = async (publicId) => {
  if (!publicId) return true

  if (!isCloudinaryConfigured || publicId.startsWith('simulated_receipt_')) {
    return true
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error.message)
    return false
  }
}

export { cloudinary, isCloudinaryConfigured }
