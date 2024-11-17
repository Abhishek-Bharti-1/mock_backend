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

     const data = await collection.find({}, { projection: { audiobooks: 1, _id: 0 } }).toArray();

    const audiobooks = data.flatMap(item => item.audiobooks);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).send('An error occurred while fetching data');
  } finally {
    await client.close();
  }
});

app.get('/api/audiobook/:id/chapters', async (req, res) => {
  try {
    const audiobookId = req.params.id; // Get the audiobook ID from the route parameter
    await client.connect();

    const database = client.db('audiobook'); 
    const collection = database.collection('audiobook');

    // Find the audiobook by ID and extract its chapters
    const audiobook = await collection.findOne(
      { "audiobooks.id": audiobookId },
      { projection: { "audiobooks.$": 1 } } // Fetch only the matching audiobook
    );

    if (!audiobook || !audiobook.audiobooks.length) {
      return res.status(404).send('Audiobook not found');
    }

    const chapters = audiobook.audiobooks[0].chapters;

    return res.status(200).json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return res.status(500).send('An error occurred while fetching chapters');
  } finally {
    await client.close();
  }
});

app.get('/api/audiobook/:audiobookId/chapter/:chapterId', async (req, res) => {
  try {
    // Extract audiobookId and chapterId from request parameters
    const { audiobookId, chapterId } = req.params;

    // Connect to MongoDB client
    await client.connect();

    // Access the database and collection
    const database = client.db('audiobook');
    const collection = database.collection('audiobooks');

    // Find the audiobook by ID
    const audiobook = await collection.findOne({ 'audiobooks.id': audiobookId });

    if (!audiobook) {
      return res.status(404).send('Audiobook not found');
    }

    // Find the chapter with the given chapterId within the audiobook
    const chapter = audiobook.audiobooks
      .flatMap(book => book.chapters)
      .find(ch => ch.id === chapterId);

    if (!chapter) {
      return res.status(404).send('Chapter not found');
    }

    // Return the audio tracks of the found chapter
    return res.status(200).json(chapter.audioTracks);
  } catch (error) {
    console.error('Error fetching audio tracks:', error);
    return res.status(500).send('An error occurred while fetching audio tracks');
  } finally {
    // Close the MongoDB client
    await client.close();
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
