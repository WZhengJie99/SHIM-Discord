const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');

const DISCORD_TOKEN = 'BOT_TOKEN';
const API_URL = 'https://smart-home-inventory-manager-api.vercel.app';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Discord bot is online!');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.trim();

    if (content.startsWith('!add_room')) {
        const roomName = content.replace('!add_room', '').trim();
        const userId = message.author.id;
        
        try {
            const response = await fetch(`${API_URL}/room/addRoom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userId, roomName })
            });

            if (response.ok) {
                message.channel.send(`Room "${roomName}" added successfully!`);
            } else {
                const errorText = await response.text();
                console.error(`Failed to add room. Status: ${response.status}, Response: ${errorText}`);
                message.channel.send('Failed to add room. Please check the details and try again.');
            }
        } catch (error) {
            console.error('Error adding room:', error);
            message.channel.send('An error occurred while adding the room.');
        }
    }

    if (content === '!view_rooms') {
        const userId = message.author.id;

        try {
            const response = await fetch(`${API_URL}/room/getAllRooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: userId })
            });

            if (response.ok) {
                const rooms = await response.json();
                if (rooms.length > 0) {
                    const roomList = rooms.map(room => `- ${room}`).join('\n');
                    message.channel.send(`Your rooms:\n${roomList}`);
                } else {
                    message.channel.send('You have no rooms added yet.');
                }
            } else {
                const errorText = await response.text();
                console.error(`Failed to retrieve rooms. Status: ${response.status}, Response: ${errorText}`);
                message.channel.send('Failed to retrieve rooms. Please try again later.');
            }
        } catch (error) {
            console.error('Error retrieving rooms:', error);
            message.channel.send('An error occurred while retrieving the rooms.');
        }
    }
});

client.login(DISCORD_TOKEN);
