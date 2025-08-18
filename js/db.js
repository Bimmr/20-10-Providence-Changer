/**
 * AWS DynamoDB client wrapper for Providence extension
 * Provides a clean interface for database operations
 */

class DatabaseClient {
    constructor() {
        this.dynamodb = null
        this.docClient = null
        this.region = 'ca-central-1'
    }

    /**
     * Initialize AWS DynamoDB connection
     */
    init() {
        if (!this.dynamodb) {
            AWS.config.region = this.region
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: DYNAMO_DB_ID,
            })

            this.dynamodb = new AWS.DynamoDB()
            this.docClient = new AWS.DynamoDB.DocumentClient()
        }
    }

    // ======================= Notes Operations =======================

    /**
     * Get notes for a specific advisor
     * @param {string} advisorId - The advisor's ID
     * @returns {Promise<Object|null>} - Notes object or null if not found
     */
    async getNotes(advisorId) {
      this.init()
        const params = {
            TableName: 'Notes',
            Key: {
                AdvisorId: advisorId
            }
        }

        try {
            const data = await this.docClient.get(params).promise()
            return data.Item || {}
        } catch (error) {
            console.error(`Failed to get notes for advisor ${advisorId}:`, error)
            throw error
        }
    }

    /**
     * Update notes for a specific advisor
     * @param {string} advisorId - The advisor's ID
     * @param {string} message - The note message
     * @returns {Promise<Object>} - Updated item
     */
    async updateNotes(advisorId, message) {
      this.init()
        const params = {
            TableName: 'Notes',
            Key: {
                AdvisorId: advisorId
            },
            UpdateExpression: "set message = :m",
            ExpressionAttributeValues: {
                ":m": message
            },
            ReturnValues: "UPDATED_NEW"
        }

        try {
            const data = await this.docClient.update(params).promise()
            return data.Attributes
        } catch (error) {
            console.error(`Failed to update notes for advisor ${advisorId}:`, error)
            throw error
        }
    }

    // ======================= Status Operations =======================

    /**
     * Get all statuses for a specific advisor
     * @param {string} advisorId - The advisor's ID
     * @returns {Promise<Array>} - Array of status objects
     */
    async getStatuses(advisorId) {
      this.init()
        const params = {
            TableName: 'Statuses',
            KeyConditionExpression: "#id = :aid",
            ExpressionAttributeNames: {
                "#id": "advisorId"
            },
            ExpressionAttributeValues: {
                ":aid": advisorId
            }
        }

        try {
            const data = await this.docClient.query(params).promise()
            return data.Items || []
        } catch (error) {
            console.error(`Failed to get statuses for advisor ${advisorId}:`, error)
            throw error
        }
    }

    /**
     * Add a new status for an advisor
     * @param {string} advisorId - The advisor's ID
     * @param {number} timestamp - The timestamp of the status
     * @param {string} officer - The officer adding the status
     * @param {string} message - The status message
     * @returns {Promise<void>}
     */
    async addStatus(advisorId, timestamp, officer, message) {
      this.init()
        const params = {
            TableName: 'Statuses',
            Item: {
                advisorId,
                timestamp,
                officer,
                message
            }
        }

        try {
          await this.docClient.put(params).promise()
          return true
        } catch (error) {
            console.error(`Failed to add status for advisor ${advisorId}:`, error)
            throw error
        }
    }

    /**
     * Delete a status for an advisor
     * @param {string} advisorId - The advisor's ID
     * @param {number} timestamp - The timestamp of the status to delete
     * @returns {Promise<void>}
     */
    async deleteStatus(advisorId, timestamp) {
      this.init()
        const params = {
            TableName: 'Statuses',
            Key: {
                advisorId,
                timestamp
            }
        }

        try {
            await this.docClient.delete(params).promise()
            return true
        } catch (error) {
            console.error(`Failed to delete status for advisor ${advisorId}:`, error)
            throw error
        }
    }

    // ======================= Rejections Operations =======================

    /**
     * Get all rejections for a specific advisor
     * @param {string} advisorId - The advisor's ID
     * @returns {Promise<Array>} - Array of rejection objects
     */
    async getRejections(advisorId) {
      this.init()
        const params = {
            TableName: 'Rejections',
            KeyConditionExpression: "#id = :aid",
            ExpressionAttributeNames: {
                "#id": "advisorId"
            },
            ExpressionAttributeValues: {
                ":aid": advisorId
            }
        }

        try {
            const data = await this.docClient.query(params).promise()
            return data.Items || []
        } catch (error) {
            console.error(`Failed to get rejections for advisor ${advisorId}:`, error)
            throw error
        }
    }

    /**
     * Update rejection status for an advisor
     * @param {string} advisorId - The advisor's ID
     * @param {string} rejectionId - The rejection ID
     * @param {Array} completedArray - Array of completion statuses
     * @returns {Promise<Object>} - Updated item
     */
    async updateRejection(advisorId, rejectionId, completedArray) {
      this.init()
        const params = {
            TableName: 'Rejections',
            Key: {
                advisorId,
                rejectionId
            },
            UpdateExpression: 'set rejection = :completedArray',
            ExpressionAttributeValues: {
                ":completedArray": completedArray
            },
            ReturnValues: "UPDATED_NEW"
        }

        try {
            const data = await this.docClient.update(params).promise()
            return data.Attributes
        } catch (error) {
            console.error(`Failed to update rejection for advisor ${advisorId}:`, error)
            throw error
        }
    }
}
