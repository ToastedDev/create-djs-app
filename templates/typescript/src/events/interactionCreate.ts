import { Event } from "../structures/Event";
import { CmdInteraction } from "../typings/Command";
import { GuildMember } from "discord.js";

export default new Event("interactionCreate", async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command)
      return interaction.reply({
        content: "That command no longer exists.",
        ephemeral: true,
      });

    try {
      command.run({
        client,
        interaction: interaction as CmdInteraction,
      });
    } catch (err) {
      console.log(err);
      interaction.reply({
        content: "An error occured.",
        ephemeral: true,
      });
    }
  }
});
