const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { OllamaClient } = require('./app/ollama_client'); // Import your OllamaClient

// Initialize Ollama client
const ollama = new OllamaClient();

// MongoDB URI
const uri = "mongodb+srv://jayalexandertrevino:jay123mongodb@photographycluster.w9dev.mongodb.net/?retryWrites=true&w=majority&appName=PhotographyCluster";

// Initialize MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Express App Setup
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit the process on a connection error
  }
}
connectToMongoDB();

// API Routes
app.get('/', (req, res) => {
  res.send('Server is running and connected to MongoDB!');
});

// Add new chat endpoint
app.post('/api/chat', async (req, res) => {
    console.log('Chat request received');
    try {
        const { message, history } = req.body;

        // More explicit instruction for complete sentences
        const contextWithInstruction = [
            ...history,
            { role: "user", content: message },
            {
                role: "system",
                content: "Provide a concise response in under 150 characters. Always complete your sentence. If approaching the limit, wrap up your current thought quickly. End with a proper punctuation mark."
            }
        ];

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        let fullResponse = '';
        const MAX_LENGTH = 150;

        // Stream the response
        for await (const chunk of ollama.streamChat(message, contextWithInstruction)) {
            fullResponse += chunk;

            // Check if we're within limit and have a complete sentence
            if (fullResponse.length <= MAX_LENGTH) {
                res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
            } else {
                // Find the last complete sentence within the limit
                const lastPeriod = fullResponse.lastIndexOf('.', MAX_LENGTH);
                const lastExclamation = fullResponse.lastIndexOf('!', MAX_LENGTH);
                const lastQuestion = fullResponse.lastIndexOf('?', MAX_LENGTH);

                // Find the latest sentence ending
                const lastComplete = Math.max(lastPeriod, lastExclamation, lastQuestion);

                if (lastComplete !== -1) {
                    // Trim to the last complete sentence
                    const trimmedResponse = fullResponse.slice(0, lastComplete + 1);
                    res.write(`data: ${JSON.stringify({ type: 'chunk', content: trimmedResponse })}\n\n`);
                }
                break;
            }
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to get response' });
    }
});

// Close MongoDB Client Gracefully on Exit
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
