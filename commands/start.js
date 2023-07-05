const { CommandType } = require("wokcommands");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");
module.exports = {
  // Required for slash commands
  description: "Job posting Embed",
  // Create a legacy and slash command
  type: CommandType.SLASH,

  // Invoked when a user runs the ping command
  callback: async ({ interaction }) => {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      await interaction.reply({
        content: "Staff only command!",
        ephemeral: true,
      });
      return;
    }
    const exampleEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: "Write a portfolio",
        iconURL: "https://i.imgur.com/AfFp7pu.png",
      })
      .setDescription("Click the button to submit your portfolio!")
      .setImage("https://i.imgur.com/AfFp7pu.png");

    const confirm = new ButtonBuilder()
      .setCustomId("post")
      .setLabel("Click to Post")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(confirm);
    interaction.reply({
      content: "Embed sent!",
      ephemeral: true,
    });
    interaction.channel.send({
      //   content: "hi",
      embeds: [exampleEmbed],
      components: [row],
    });
  },
};
