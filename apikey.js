const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const salt_rounds = 10

exports.gen_uuid = () => {
    return uuidv4()
}

exports.hash = async (secret) => { 
    return await bcrypt.hash(secret, salt_rounds)
}

exports.compare_secrets = async (hash, secret) => {
    return await bcrypt.compare(secret, hash)
}