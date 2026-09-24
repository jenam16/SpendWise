import mongoose from 'mongoose'

/**
 * Safely migrate NotificationPreferences:
 * 1. Synchronize valid user -> userId for existing genuine user preferences.
 * 2. Delete corrupt/dummy documents (such as 'dev-user-001' or documents where neither user nor userId is a valid ObjectId).
 * 3. Deduplicate any duplicate documents for the same userId (keeping the latest).
 */
export const migrateNotificationPreferences = async () => {
  try {
    const collection = mongoose.connection.collection('notificationpreferences')
    const allDocs = await collection.find({}).toArray()

    const seenUserIds = new Set()

    for (const doc of allDocs) {
      const hasValidUser = doc.user && mongoose.Types.ObjectId.isValid(doc.user)
      const hasValidUserId = doc.userId && mongoose.Types.ObjectId.isValid(doc.userId)

      // Case 1: Corrupt or dummy document (neither user nor userId is a valid MongoDB ObjectId)
      if (!hasValidUser && !hasValidUserId) {
        console.log(`[Migration] Safely removing invalid dummy notification preference document: ${doc._id}`)
        await collection.deleteOne({ _id: doc._id })
        continue
      }

      // Determine the canonical ObjectId for this user
      const canonicalId = hasValidUserId
        ? new mongoose.Types.ObjectId(doc.userId)
        : new mongoose.Types.ObjectId(doc.user)
      const canonicalStr = canonicalId.toString()

      // Case 2: Deduplication - if we have already processed a preference document for this user, delete duplicate
      if (seenUserIds.has(canonicalStr)) {
        console.log(`[Migration] Removing duplicate notification preference document for user ${canonicalStr}: ${doc._id}`)
        await collection.deleteOne({ _id: doc._id })
        continue
      }

      seenUserIds.add(canonicalStr)

      // Case 3: Ensure both userId and user fields are correctly set to the canonical ObjectId
      const needsUserFix = !hasValidUser || doc.user.toString() !== canonicalStr
      const needsUserIdFix = !hasValidUserId || doc.userId.toString() !== canonicalStr

      if (needsUserFix || needsUserIdFix) {
        console.log(`[Migration] Aligning notification preference ${doc._id} for user ${canonicalStr}`)
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              userId: canonicalId,
              user: canonicalId,
            },
          }
        )
      }
    }
  } catch (err) {
    console.error('[Migration] Notice in migrateNotificationPreferences:', err.message)
  }
}
