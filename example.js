// import {InfluxDBClient, Point} from '@influxdata/influxdb3-client'

// // ECMAScript Modules syntax
// import dotenv from 'dotenv';
// dotenv.config();

// const token = process.env.INFLUXDB_TOKEN

// async function main() {
//     const client = new InfluxDBClient({host: 'https://us-east-1-1.aws.cloud2.influxdata.com', token: process.env.TOKEN})

//     // following code goes here

//     let database = `datalogger`

//     const points =
//         [
//             Point.measurement("census")
//                 .setTag("location", "Klamath")
//                 .setIntegerField("bees", 23),
//             Point.measurement("census")
//                 .setTag("location", "Portland")
//                 .setIntegerField("ants", 30),
//             Point.measurement("census")
//                 .setTag("location", "Klamath")
//                 .setIntegerField("bees", 28),
//             Point.measurement("census")
//                 .setTag("location", "Portland")
//                 .setIntegerField("ants", 32),
//             Point.measurement("census")
//                 .setTag("location", "Klamath")
//                 .setIntegerField("bees", 29),
//             Point.measurement("census")
//                 .setTag("location", "Portland")
//                 .setIntegerField("ants", 40)
//         ];

//     for (let i = 0; i < points.length; i++) {
//         const point = points[i];
//         await client.write(point, database)
//             // separate points by 1 second
//             .then(() => new Promise(resolve => setTimeout(resolve, 1000)));
//     }


//     client.close()
// }

// main()

const raw_string = `+CMT: "+918019301542","","24/01/30,14:27:22+22"
Temperature: 38.3 MCC: 404 MNC: 49 LAC: 0A8D CellID: A795`;

// Split the raw_string based on ","
const rawValues = raw_string.split(",");

console.log(rawValues)

// Extract phoneNumber, date from the split values
const phoneNumber = rawValues[0].split(":")[1].trim();
const date = rawValues[2].trim();

// Extract the string starting from "Temperature" till the end
const temperatureString = rawValues[3].split("Temperature:")[1].trim();

const timeString = rawValues[3].split("Temperature")[0].trim();

// Split the temperatureString based on space to get temperature value
const temperatureValues = temperatureString.split(" ");

// Log the extracted values
console.log("Phone Number:", phoneNumber);
console.log("Date:", date);
console.log("Temperature Values:", temperatureValues);
console.log("Time String", timeString);



