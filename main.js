const express = require("express")
const app = express()
const port = 6000

let debug = true

const database = require("./database.js")
database.setup()


const apikey = require("./apikey.js")
const routes = require("./routes.js")

app.use(
    express.json({
        verify: (req, _res, buffer) => (req["rawBody"] = buffer),
    })
);

// add a debug key to test with
if (debug) {
    let key = apikey.gen_uuid()
    let secret = apikey.gen_uuid()
    apikey.hash(secret).then((hash) => {
        console.log("key:", key, "\nsecret:", secret)
        database.add("my-awesome-app", key, hash, true)
    })
}

routes.setup(app)


app.listen(port, () => {
    console.log("listening on", port)
})