import mongoose from 'mongoose'

let mongoMemoryServer = null

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  // Try connecting to provided MONGODB_URI first
  if (uri) {
    try {
      console.log(`Connecting to MongoDB at ${uri.replace(/\/\/.*@/, '//<credentials>@')}...`)
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
      })
      console.log(`✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`)
      return conn
    } catch (err) {
      console.warn(`! Failed to connect to ${uri}: ${err.message}`)
      console.log('Falling back to local in-memory MongoDB runner for seamless local dev...')
    }
  }

  // Fallback: Use mongodb-memory-server
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    mongoMemoryServer = await MongoMemoryServer.create()
    const memoryUri = mongoMemoryServer.getUri()
    const conn = await mongoose.connect(memoryUri)
    console.log(`✓ In-Memory MongoDB Connected: ${memoryUri}`)
    return conn
  } catch (memErr) {
    console.error(`✗ Critical: Could not connect to any MongoDB instance: ${memErr.message}`)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop()
  }
}
