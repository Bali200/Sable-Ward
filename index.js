const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const express = require('express');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Bans a user')
      .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kicks a user')
      .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true)),

    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Warns a user')
      .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
      .addStringOption(option => option.setName('reason').setDescription('Reason for the warning').setRequired(true)),

    new SlashCommandBuilder()
      .setName('sable')
      .setDescription('Sends a random Sable photo'),
    
    new SlashCommandBuilder()
      .setName('line')
      .setDescription('Sends a random Sable voice line'),
    
    new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Clears a specified number of recent messages in the channel')
      .addIntegerOption(option => 
        option.setName('range')
          .setDescription('The number of messages to delete (max 100)')
          .setRequired(true))

  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

  rest.put(Routes.applicationCommands(client.user.id), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
});

// Listen for guildMemberAdd event and assign a role
client.on('guildMemberAdd', async member => {
  const roleId = '1269680128871501996'; // ID of the role to assign
  const role = member.guild.roles.cache.get(roleId);

  if (role) {
    try {
      await member.roles.add(role);
      console.log(`Assigned role ${role.name} to ${member.user.tag}`);
    } catch (error) {
      console.error(`Failed to assign role: ${error}`);
    }
  } else {
    console.error(`Role with ID ${roleId} not found.`);
  }
});

// Handle suggestions channel messages
client.on('messageCreate', async message => {
  const suggestionChannelId = '1270153824643846164'; // ID of the suggestion channel
  
  // Check if the message is in the suggestion channel and is not sent by a bot
  if (message.channel.id === suggestionChannelId && !message.author.bot) {
    const suggestionAuthor = message.author;
    const suggestionContent = message.content;
    await message.delete(); // Delete the original message

    // Send the suggestion content as a code block (quote)
    const suggestionMessage = await message.channel.send(`${suggestionAuthor}:` + `\`\`\` ${suggestionContent}\`\`\``);

    // React to the message with the specified emojis
    await suggestionMessage.react('🔺');
    await suggestionMessage.react('🔻');
  }
});

// Handle emote suggestions channel messages
client.on('messageCreate', async message => {
  const suggestionChannelId = '1270369264171225088'; // ID of the suggestion channel
  
  // Check if the message is in the suggestion channel and is not sent by a bot
  if (message.channel.id === suggestionChannelId && !message.author.bot) {
    const suggestionAuthor = message.author;

    // Check if the message has attachments
    if (message.attachments.size > 0) {
      // Get the first attachment
      const suggestionAttachment = message.attachments.first();
      await message.delete(); // Delete the original message

      // Re-send the attachment with content
      const suggestionMessage = await message.channel.send({
        content: `${suggestionAuthor}:`,
        files: [{
          attachment: suggestionAttachment.attachment // Use the attachment data directly
        }]
      });

      // React to the message with the specified emojis
      await suggestionMessage.react('🔺');
      await suggestionMessage.react('🔻');
    } else {
      // If no attachments, you could optionally send a reply or handle it differently
      const reply = await message.reply("Please attach an image for your emote suggestion.");
      setTimeout(() => reply.delete(), 5000); // Delete the reply after 5 seconds
      await message.delete();
    }
  }
});

// Listen for specific emoji messages in the tennis channel
client.on('messageCreate', async message => {
  const tennisChannelId = '1270402719806521417'; // ID of the tennis channel
  const emojiId1 = '1270402268877033543'; // ID of the first emoji <:SableWardKWACK>
  const emojiId2 = '1270402244487151777'; // ID of the second emoji <:SableWardWACK>

  if (message.channel.id === tennisChannelId && !message.author.bot) {
    // Check if the message contains the first emoji
    if (message.content.includes(`<:SableWardKWACK:${emojiId1}>`)) {
      await message.channel.send(`<:SableWardWACK:${emojiId2}>`);
    } 
    // Check if the message contains the second emoji
    else if (message.content.includes(`<:SableWardWACK:${emojiId2}>`)) {
      await message.channel.send(`<:SableWardKWACK:${emojiId1}>`);
    }

    else {
      const reply = await message.reply("Pleas send emoji to play.");
      setTimeout(() => reply.delete(), 3000);
      await message.delete();
    }
    
  }
});


// Listen for slash commands and respond
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'ban') {
    const user = options.getUser('user');
    if (interaction.member.permissions.has('BAN_MEMBERS')) {
      const member = interaction.guild.members.cache.get(user.id);
      if (member) {
        await member.ban();
        await interaction.reply({ content: `Banned ${user.tag}`, ephemeral: true });
      } else {
        await interaction.reply({ content: 'User not found in the server.', ephemeral: true });
      }
    } else {
      await interaction.reply({ content: 'You do not have permission to ban members.', ephemeral: true });
    }
  }

  if (commandName === 'kick') {
    const user = options.getUser('user');
    if (interaction.member.permissions.has('KICK_MEMBERS')) {
      const member = interaction.guild.members.cache.get(user.id);
      if (member) {
        await member.kick();
        await interaction.reply({ content: `Kicked ${user.tag}`, ephemeral: true });
      } else {
        await interaction.reply({ content: 'User not found in the server.', ephemeral: true });
      }
    } else {
      await interaction.reply({ content: 'You do not have permission to kick members.', ephemeral: true });
    }
  }

  if (commandName === 'warn') {
    const user = options.getUser('user');
    const reason = options.getString('reason');
    const warnChannelId = '1269752811726311446'; // ID kanału, na którym mają być wysyłane informacje o ostrzeżeniach

    if (interaction.member.permissions.has('MANAGE_MESSAGES')) {
      // Implement your own warning system here
      await interaction.reply({ content: `Warned ${user.tag} for: ${reason}`, ephemeral: true });

      const warnChannel = interaction.guild.channels.cache.get(warnChannelId);
      if (warnChannel) {
        await warnChannel.send(`Warn dla: <@${user.id}>, powód: ${reason}`);
      } else {
        console.error(`Kanał o ID ${warnChannelId} nie został znaleziony.`);
      }
    } else {
      await interaction.reply({ content: 'You do not have permission to warn members.', ephemeral: true });
    }
  }

  if (commandName === 'sable') {
    const links = [
      'https://deadbydaylight.com/static/18f59ffadbe3fa28c1d170a4960ea260/332c5/DBD_Website_Ch31_Character_Page_Survivor_Sable_084678d1f0.png',
      'https://static.wikia.nocookie.net/deadbydaylight_gamepedia_en/images/9/9c/S41_SableWard_Portrait.png/revision/latest/scale-to-width-down/512?cb=20240517102934',
      'https://static1.srcdn.com/wordpress/wp-content/uploads/2024/02/sable-ward-from-dead-by-daylight.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5hQhprztzmwwirCkKoz2lOfV5C5s761axKw&s',
      'https://preview.redd.it/what-are-your-thoughts-on-sable-ward-so-far-do-you-have-v0-lei542dowyjc1.jpeg?auto=webp&s=295f0b459d9d0ae498f7842fe7b40a6190361fc3'
      // Add more links here
    ];

    const randomLink = links[Math.floor(Math.random() * links.length)];
    await interaction.reply({ content: `${randomLink}`, ephemeral: false });
  }

  if (commandName === 'line') {
    const lines = [
      "Great.",
      "Not again.",
      "I get the feeling something bad is about to happen. Yum.",
      "I get the feeling something horrible is about to happen.",
      "This all feels very familiar.",
      "Super.",
      "Yum.",
      "Where am I?",
      "Where’s Toto?",
      "Fantastic.",
      "A fire. Yeah. We’re so lucky.",
      "A fire. Yum. Bring out the marshmallows.",
      "A fire. Yum.",
      "Whatever we do, separating isn’t the best idea.",
      "Who forgot the marshmallows? The nerve.",
      "Okay. People. Let’s try to work as a team.",
      "Okay. This is not what I expected.",
      "A fire. Wow. We’re so lucky.",
      "Does anyone know where we are?",
      "This ain’t Kansas, is it?",
      "I feel like Dorothy. Except no dog and no flying house.",
      "So the moral of the story is… doesn’t matter…",
      "So the moral of the story is… stay away from the fog…",
      "So the moral of the story is… you see fog… you run away…",
      "So the moral of the story is… we’re screwed…",
      "So the moral of the story is… death isn’t what I expected…",
      "This feels like something I read.",
      "It’s like I’m in a story I heard at the Moonstone.",
      "Anyone else feel like they are being watched?",
      "I have the feeling I’ve been here before.",
      "I just had a déjà vu. Yum.",
      "I just had a déjà vu. I think I know what’s going to happen next.",
      "I haven’t enjoyed a moment like this since I had my wisdom teeth pulled.",
      "Yeah. Let’s hear a campfire story.",
      "Someone bring a radio? I want to hear a creepy story.",
      "She is protected by the Power of Good, and that is greater than the Power of Evil. I hope.",
      "If we walk far enough… we shall sometime come to someplace.",
      "Okay. I want to wake up now. Seriously.",
      "Anyone have a story they want to share?",
      "Anyone have a HAM? I know a great station for scary stories."
    ];

    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    await interaction.reply({ content: `${randomLine}`, ephemeral: false});
  }

    // Clear command
    if (commandName === 'clear') {
      const range = options.getInteger('range');
  
      if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
        await interaction.reply({ content: 'You do not have permission to clear messages.', ephemeral: true });
        return;
      }
  
      if (range < 1 || range > 100) {
        await interaction.reply({ content: 'Please specify a number between 1 and 100.', ephemeral: true });
        return;
      }
  
      try {
        await interaction.channel.bulkDelete(range, true);
        await interaction.reply({ content: `Successfully deleted ${range} messages.`, ephemeral: true });
      } catch (error) {
        console.error('Error deleting messages:', error);
        await interaction.reply({ content: 'An error occurred while trying to delete messages.', ephemeral: true });
      }
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
