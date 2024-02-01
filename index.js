// Importing necessary modules
import express from 'express';
import axios from 'axios';

import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create an instance of Express
const app = express();

// Using middleware to parse JSON in the request body
app.use(express.json());




// Function to upload data to InfluxDB
async function uploadToInfluxDB(message) {

  console.log(message)

  const client = new InfluxDBClient({
    host: 'https://us-east-1-1.aws.cloud2.influxdata.com',
    token: process.env.TOKEN
  });

  
  

  const database = `datalogger`;

   // Extracting date, MCC, MNC, LAC, and Cellid from the message
   // Remove unnecessary characters from the message
  const rawValues = message.split(",")

  console.log(rawValues)

  // Extract phoneNumber, date from the split values
  const phoneNumber = rawValues[0].split(":")[1].trim();
  const date = rawValues[2].trim();
  const time = rawValues[3].split("Temperature")[0].trim();
  const trackerString = rawValues[3].split("Temperature:")[1].trim();

  const trackerValues = trackerString.split(" ")
  const temperature = trackerValues[0];
  const mcc = trackerValues[2];
  const mnc = trackerValues[4];
  const lac = parseInt(trackerValues[6], 16); // Convert hex to decimal
  const cellid = parseInt(trackerValues[8],16); // Convert hex to decimal

  console.log(phoneNumber, date, time, temperature, mcc, mnc, lac, cellid);

    const url = `https://cellphonetrackers.org/gsm/classes/Cell.Search.php?mcc=${mcc}&mnc=${mnc}&lac=${lac}&cid=${cellid}`;

    console.log(url);

    const response = await axios.get(url);

    // Parse the response to extract lat and lon
    const matchLatLon = response.data.match(/Lat=([\d.]+) Lon=([\d.]+)/);

    if (!matchLatLon) {
      throw new Error('Invalid response format');
    }

    const latitude = parseFloat(matchLatLon[1]);
    const longitude = parseFloat(matchLatLon[2]);

    console.log("Got location Details ", latitude, longitude);

    const point = Point.measurement('DataLoggerV3')
    .setTag('operator', 'loggerDetails')
    .setStringField('longitude', longitude.toString())
    .setStringField('latitude', latitude.toString())
    .setStringField('date', date.toString())
    .setStringField('date', time.toString())
    .setStringField('loggerId',phoneNumber)
    .setStringField('temperature', temperature)


  await client.write(point, database);

  client.close();
}

// Define a route for the '/upload' endpoint
app.post('/upload', (req, res) => {
  // Logging the JSON body from the request
  console.log('Received POST request at /upload with body:', req.body);

  // Extracting the relevant data from the request body
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message parameter' });
  }

  // Call the function to upload data to InfluxDB
  uploadToInfluxDB(message)
    .then(() => {
      // Sending a response to the client
      res.send({success: 'Data uploaded to InfluxDB successfully!'});
    })
    .catch((error) => {
      console.error('Error uploading data to InfluxDB:', error);
      res.status(500).send({error : 'Data Upload Failed'});
    });
});


// Define a route for the '/query' endpoint
app.get('/query', async (req, res) => {
    console.log("query")
    const client = new InfluxDBClient({
        host: 'https://us-east-1-1.aws.cloud2.influxdata.com',
        token: process.env.TOKEN
      });
    
    try {
      // Construct the InfluxDB query
      const query = `SELECT * FROM 'DataLoggerV3' 
        WHERE time >= now() - interval '24 hours' AND 
        ('latitude' IS NOT NULL OR 'longitude' IS NOT NULL) order by time asc`

        const rows = await client.query(query, 'datalogger')
        console.log(rows);

        const result = []
        for await (const row of rows) {
            result.push(row);

           
            
        }
        console.log(result);
         res.status(200).json(result)
            } catch (error) {
            console.error('Error executing InfluxDB query:', error);
            res.status(500).send('Internal Server Error');
            }
        });


        app.get('/history', async (req, res) => {
          console.log("query");
          const client = new InfluxDBClient({
              host: 'https://us-east-1-1.aws.cloud2.influxdata.com',
              token: process.env.TOKEN
          });
      
          try {
              // Construct the InfluxDB query for past 90 days
              const query = `SELECT * FROM 'DataLoggerV3' 
                  WHERE time >= now() - interval '90 Days' AND 
                  ('latitude' IS NOT NULL OR 'longitude' IS NOT NULL) ORDER BY time ASC`;
      
              const rows = await client.query(query, 'datalogger');
              console.log(rows);
      
              const result = [];
              for await (const row of rows) {
                  result.push(row);
              }
              console.log(result);
              res.status(200).json(result);
          } catch (error) {
              console.error('Error executing InfluxDB query:', error);
              res.status(500).send('Internal Server Error');
          }
      });
      


        app.get("/iottest", (req,res) => {
          res.status(200).send({"message": "IOT API Ping Success!!!"})
        })

  

        // Set the server to listen on port 3000
        const port = 7070;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
