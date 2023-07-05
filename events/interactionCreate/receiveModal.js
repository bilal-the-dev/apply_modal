const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
///getch or cache client where await interacion.repy/channe.send await create channel fetch member if he's not there
module.exports = async (interaction, instance) => {
  // console.log(interaction.values);
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId.startsWith("id")) {
    const id = interaction.customId.split("-")[1];
    const title = interaction.fields.getTextInputValue("title");
    const desc = interaction.fields.getTextInputValue("desc");
    const experience = interaction.fields.getTextInputValue("experience");
    const pay = interaction.fields.getTextInputValue("pay");

    // fetch the channnel
    const user = interaction.user;
    try {
      const channel = await interaction.guild.channels.fetch(id);
      //create embed with button
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({
          name: `${user.username}'s Portfolio`,
          iconURL: `${user.displayAvatarURL({ dynamic: true })}`,
        })
        .addFields(
          { name: "User", value: `${user}` },
          { name: "Title", value: `${title}` },

          {
            name: "Desc",
            value: `${desc}`,
          },
          {
            name: "Experience",
            value: `${experience}`,
          },
          {
            name: "Pay",
            value: `${pay}`,
          }
        )
        .setThumbnail(`${user.displayAvatarURL({ dynamic: true })}`)
        .setTimestamp();

      const choose = new ButtonBuilder()
        .setCustomId("choose")
        .setLabel("Choose")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      const row = new ActionRowBuilder().addComponents(choose);
      //send embed
      await channel.send({
        embeds: [embed],
        components: [row],
      });
    } catch (error) {
      console.log(error);
    }

    // reply the interaction
    await interaction.reply({
      content: "Your submission was received successfully!",
      ephemeral: true,
    });
  }
};
