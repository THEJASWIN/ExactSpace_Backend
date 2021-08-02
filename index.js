import express from 'express'
import cors from 'cors'
import moment from 'moment'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'

const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
let prevArray = Array(64).fill().map(() => -32000)

const PORT = process.env.PORT || 443

const ATLAS_URI = 'mongodb+srv://thejaswin:thejas25@cluster0.qfw9o.mongodb.net/exactspace?retryWrites=true&w=majority'

mongoose.connect(ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(e => console.log(e.message, "CustomError"))

app.get('/test', (req, res) => {
    res.status(200).send("Testing successful...")
})

app.post('/test/indexvaldata', async (req, res) => {
    let d = new Date()
    let name = req.body.name
    console.log("Previos before updation :", prevArray)
    let currValuesStr = req.body.data

    currValuesStr = currValuesStr.replace(" ", "")
    let currValues = currValuesStr.split(",")

    currValues = currValues.map((val) => parseInt(val))
    console.log("start", parseFloat(d.getTime()))
    let outputArray = check_vals(prevArray, currValues, 2)
    console.log("end", parseFloat(d.getTime()))
    prevArray = outputArray

    console.log("Previos after updation :", outputArray)
    console.log("Output :", outputArray)

    const data = new Data({ name, sensorOutput: outputArray, time: moment().format('LT'), date: moment().format('LL') })
    try {
        await data.save()
        console.log(data)
        res.status(201).json(data)

    } catch (error) {
        res.status(409).json({ message: error.message })
    }
})

const check_vals = (arr1, arr2, delta) => {
    if (arr1 === arr2)
        return arr1
    else {
        let output = []
        for (let i = 0; i < arr1.length; i++) {
            if (Math.abs(arr1[i] - arr2[i]) > delta) {
                output.push(arr2[i])
            } else {
                output.push(arr1[i])
            }
        }
        return output
    }
}

const dataSchema = mongoose.Schema({
    name: String,
    sensorOutput: [Number],
    time: String,
    date: String
}, { versionKey: false })
const Data = mongoose.model('Data', dataSchema)