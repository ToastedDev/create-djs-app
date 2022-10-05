module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    const cmd = client.commands.get(interaction.commandName);

    if (!cmd)
      return interaction.reply({
        content: "That command no longer exists.",
        ephemeral: true,
      });

    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );

    try {
      await cmd.run(client, interaction);
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "An error occured.",
        ephemeral: true,
      });
    }
  }
};
