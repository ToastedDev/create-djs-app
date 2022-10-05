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

  const rest = new REST({ version: "9" }).setToken(process.env.token);

  client.on("ready", async () => {
    const deploySlashGlobally =
      client.config.deploySlashGlobally === "false" ? false : true;
    await rest.put(
      deploySlashGlobally
        ? Routes.applicationCommands(client.user.id)
        : Routes.applicationGuildCommands(
            client.user.id,
            client.config.guildId
          ),
      {
        body: commands,
      }
    );
  });
};
