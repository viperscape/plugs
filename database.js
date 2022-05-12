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

exports.add = async (app_name, key, hash, is_paid) => {
    try {
        const entity = {
            partitionKey: app_name,
            rowKey: key,
            hash: hash,
            isPaid: is_paid,
            creationDate: new Date()
        }

        await client.createEntity(entity)
    }
    catch (e) {
        console.error(e)
    }
}

exports.update = async (app_name, key, hash, is_paid) => {
    const entity = {
        partitionKey: app_name,
        rowKey: key,
        hash: hash,
        isPaid: is_paid
    }

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

/// call back with entities to iterate on
exports.foreach = async (cb) => {
    try {
        for await (const ent of client.listEntities()) {
            if (cb) cb(ent);
        }
    }
    catch (e) {
        console.error(e)
    }
}