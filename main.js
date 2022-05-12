const express = require("express")
const app = express()
const port = 6000
const app_name = "test-api"
let debug = true

const database = require("./database.js")
database.setup() // todo consider returning client context



const routes = require("./routes.js")

app.use(
    express.json({
        verify: (req, _res, buffer) => (req["rawBody"] = buffer),
    })
);

if (debug) {
    let key = "884c487a-aeed-4936-a258-1082642a81a3"
    let hash = "$2b$10$ZxxwqIQJZ1Rge22AIWMJDuOoNAPRgfidzvLlfS1uap2ws.N5nLwUi"
    
    database.add(app_name, key, hash, true)
}

routes.setup(app, app_name)


app.listen(port, () => {
    console.log("listening on", port)
})