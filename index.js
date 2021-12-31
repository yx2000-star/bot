// //creating server

// const express = require('express')
// const app = express()
// const router = express.Router()

// const port = process.env.PORT || 3000
// const path = require('path')

// router.get('/', (req, res) => {
//     res.send(path.join(__dirname + './index.html'))
// })

// app.use('/', router)
// app.listen(port, () => {
//     console.log(`Server running on port ${port}`)
// });

const express = require('express')
const app = express()
const path = require('path')
const router = express.Router()

const browserObj = require('./launchBrowser')
const scraperController = require('./pageController')

let browserInstance = browserObj.launchBrowser()
scraperController(browserInstance)

const port = process.env.PORT || 3000
router.get('/', (res, req) => {
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.use('/', router)
app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

