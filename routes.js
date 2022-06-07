const apikey = require("./apikey.js")
const database = require("./database.js")

const sessions = {}

async function gen_session (app_name, key, secret)
{
    let is_auth = false
    if (sessions[key]) is_auth = sessions[key] == secret // check session in memory for faster comparisons
    else {
        let ent = await database.get(app_name, key)
        if (ent && ent.hash && ent.isActive)
        {
            is_auth = await apikey.compare_secrets(ent.hash, secret)
            if (is_auth) {
                sessions[key] = secret
            }
        }
        else if (ent && !ent.isActive) console.log("access to deactivated key", app_name, key)
    }

    return is_auth
}


exports.setup = async (app) => {
    // generate new key
    app.post("/key/:app_name", async (req, res) => {
        try {
            const app_name = req.params.app_name // todo santize name?

            // create key combo for identification and authorization
            let key = apikey.gen_uuid()
            let secret = apikey.gen_uuid()

            // save to database
            let hash = await apikey.hash(secret) // secure hash for database
            database.add(app_name, key, hash)

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

    // archive key from use
    app.delete("/key/:app_name", async (req, res) => {
        try {
            const app_name = req.params.app_name;
            const key = req.headers["api-key"]
            const secret = req.headers["api-secret"]
            
            if (!key || !secret) {
                res.send(400)
                return
            }

            let is_auth = await gen_session(app_name, key, secret) // check session/hash comparison

            if (is_auth)
            {
                delete sessions[key]
                await database.update(app_name, key, false)
                res.send(200)
            }
            else res.send(400)
        }
        catch (err) {
            console.error(err)
            res.send(400)
        }
    })

    // example use of the key
    app.get("/key/:app_name", async (req, res) => {
        try {
            const app_name = req.params.app_name;
            const key = req.headers["api-key"]
            const secret = req.headers["api-secret"]

            if (!key || !secret) { // headers exist?
                res.send(400)
                return
            }

            let is_auth = await gen_session(app_name, key, secret) // generate a session, if the key pair matches

            if (!is_auth) res.send(400)
            else res.send(200)
        }
        catch (err) {
            console.error(err)
            res.send(400)
        }
    })

    // update secret for key
    // note request query must include a refresh boolean
    app.put("/key/:app_name", async (req, res) => {
        try {
            const app_name = req.params.app_name;
            const key = req.headers["api-key"]
            const secret = req.headers["api-secret"]

            if (!key || !secret || !req.query.refresh) {
                res.send(400)
                return
            }

            let is_auth = await gen_session(app_name, key, secret)

            if (is_auth)
            {
                let new_secret = apikey.gen_uuid()
                let hash = await apikey.hash(new_secret)
                database.update(app_name, key, true, hash)

                sessions[key] = new_secret // update secret for session

                let keys = {
                    secret: new_secret
                }
    
                res.send(keys)
            }
            else res.send(400)
        }
        catch (err) {
            console.error(err)
            res.send(400)
        }
    })
}