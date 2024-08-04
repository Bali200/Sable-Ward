// Import the required modules
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Listen for messages and respond
client.on('messageCreate', message => {
  if (message.author.bot) return; // Ignore bot messages
  if (message.content === '!ping') {
    message.channel.send('Pong!');
  }
});

// Log in to Discord with your app's token from the environment variables
client.login(process.env.DISCORD_BOT_TOKEN);

// Create an Express application
const app = express();

// Define a simple route for the home page
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Define a health check route
app.get('/health', (req, res) => {
  if (client.isReady()) {
    res.status(200).send('Bot is healthy and running!');
  } else {
    res.status(503).send('Bot is not running.');
  }
});

// Start the server and listen on a port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
