const Discord = require("discord.js");
require("dotenv/config");

const client = new Discord.Client({
  intents: ["Guilds"],
});

client.config = require("../config.json");
client.commands = new Discord.Collection();

["commands", "events"].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

client.login(process.env.token);
