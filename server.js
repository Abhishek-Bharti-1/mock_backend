const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const port = 3000;

const uri = "mongodb+srv://mehulxy21:bETCO7iP1hYl0924@amazondb.6ploi6k.mongodb.net";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.get('/api/collection', async (req, res) => {
  try {
    await client.connect();

    const database = client.db('audiobook'); 
    const collection = database.collection('audiobook');

    const data = await collection.find({}).toArray();

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).send('An error occurred while fetching data');
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
