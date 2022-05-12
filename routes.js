const apikey = require("./apikey.js")
const database = require("./database.js")

const sessions = {}

async function gen_session(key, stored_hash, test_secret) {
    const match = await apikey.compare_secrets(stored_hash, test_secret)
    if (match) {
        sessions[key] = test_secret
    }

    return match
}

exports.setup = async (app) => {
    app.post("/gen-key/:app_name", async (req, res) => {
        try {
            const app_name = req.params.app_name;
            // create key combo for identification and authorization
            let key = apikey.gen_uuid()
            let secret = apikey.gen_uuid()

            // save to database
            let hash = await apikey.hash(secret) // secure hash for database
            database.add(app_name, key, hash, true)

            let keys = {
                key: key,
                secret: secret
            }

            res.send(keys)
        }
        catch (err) {
            console.error(err)
            res.send(400)
        }
    })

    app.post("/test-key/:app_name", async (req, res) => {
        try {
            const app_name = req.params.app_name;
            const key = req.headers["api-key"]
            const test_secret = req.headers["api-secret"]

            if (!key || !test_secret) res.send(400) // headers exist?

            // compare secret
            let is_auth = false
            if (sessions[key]) is_auth = sessions[key] == test_secret // store key in memory for faster comparisons
            else {
                let ent = await database.get(app_name, key)
                let stored_hash = ent.hash
                if (stored_hash)
                    is_auth = await gen_session(key, stored_hash, test_secret) // generate a session, if the key pair matches
            }

            if (!is_auth) res.send(400)
            else res.send(200)
        }
        catch (err) {
            console.error(err)
            res.send(400)
        }
    })

}