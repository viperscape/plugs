const tables = require("@azure/data-tables")
require("dotenv").config()

const account = process.env["AZURE_STORAGE_ACCOUNT"]
const key = process.env["AZURE_STORAGE_KEY"]
const table_name = process.env["AZURE_STORAGE_TABLE"]

const credential = new tables.AzureNamedKeyCredential(account, key);
const client = new tables.TableClient(
    `https://${account}.table.core.windows.net`, table_name, credential
);

exports.setup = async () => {
    try {
        await client.createTable()
    }
    catch (e) {
        console.error(e)
    }
}

exports.add = async (app_name, key, hash) => {
    try {
        const entity = {
            partitionKey: app_name,
            rowKey: key,
            hash: hash,
            isActive: true,
            creationDate: new Date()
        }

        await client.createEntity(entity)
    }
    catch (e) {
        console.error(e)
    }
}

// note should only be called after hash has been compared
exports.update = async (app_name, key, is_active, hash) => {
    const entity = {
        partitionKey: app_name,
        rowKey: key,
        isActive: is_active
    }

    if (hash) entity.hash = hash // updating the hash?

    await client.updateEntity(entity)
}

exports.get = async (app_name, key) => {
    try {
        return await client.getEntity(app_name, key)
    }
    catch (e) {
        console.error(e)
    }
}