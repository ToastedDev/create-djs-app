const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");

module.exports = async (client) => {
  const commands = [];

  fs.readdirSync("./src/commands/").forEach((dir) => {
    const slashCommandFiles = fs
      .readdirSync(`./src/commands/${dir}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of slashCommandFiles) {
      const command = require(`../commands/${dir}/${file}`);
      commands.push(command.data.toJSON());
      client.commands.set(command.data.toJSON().name, command);
    }
  });

  client.on("ready", async () => {
    if (!client.config.deploySlashGlobally) {
      const guild = client.guilds.cache.get(client.config.guildId);
      guild?.commands.set(commands);
      console.log(`Registered commands in ${guild?.name}.`);
    } else {
      this.application?.commands.set(commands);
      console.log("Registered commands globally.");
    }
  });
};
