const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Pong."),
  run: async (client, interaction) => {
    interaction.reply("Pong!");
  },
};
