const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const ticketSchema = require("../../models/ticket-schema");
const config = require("../../config.json");
const ticketCategory = config.ticketCategory;
module.exports = async (interaction, instance) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "post") {
    const select = new StringSelectMenuBuilder()
      .setCustomId("starter")
      .setPlaceholder("Make a selection!")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Frontend")
          .setDescription("UI/UX Channel")
          .setValue("1119653272618274908")
          .setEmoji("🕸"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Backend")
          .setDescription("How JavaScript works BTS?")
          .setValue("1119653296966217759")
          .setEmoji("💻")
      );
    const row1 = new ActionRowBuilder().addComponents(select);
    const message = await interaction.reply({
      components: [row1],
      content: "Please select a channel to post in.",
      ephemeral: true,
      fetchReply: true,
    });
    // Show the modal to the user
    const collector = message.createMessageComponentCollector({
      filter: (u) => u.user.id === interaction.user.id,
    });

    collector.on("collect", async (cld) => {
      const [channelID] = cld.values;
      const modal = new ModalBuilder()
        .setCustomId(`id-${channelID}`)
        .setTitle("My Modal");

      const title = new TextInputBuilder()
        .setCustomId("title")
        // The label is the prompt the user sees for this input
        .setLabel("Write a title.")
        .setPlaceholder("Enter some title")
        // Short means only a single line of text
        .setStyle(TextInputStyle.Short);

      const desc = new TextInputBuilder()
        .setCustomId("desc")
        .setLabel("Write a description for your post.")
        .setPlaceholder("Enter some desc")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

      const experience = new TextInputBuilder()
        .setCustomId("experience")
        .setLabel("Please write your previous experience.")

        .setPlaceholder("Enter your experience")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

      const pay = new TextInputBuilder()
        .setCustomId("pay")
        .setLabel("How much pay do you want?")
        .setPlaceholder("Enter the pay amount")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(title);
      const secondActionRow = new ActionRowBuilder().addComponents(desc);
      const thirdActionRow = new ActionRowBuilder().addComponents(experience);
      const fourthActionRow = new ActionRowBuilder().addComponents(pay);

      // Add inputs to the modal
      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow
      );
      await cld.showModal(modal);
    });
    // await interaction.showModal(modal);
  } else if (interaction.customId === "choose") {
    const user = interaction.user;
    const message = interaction.message;
    const pattern = /<@(\d+)>/;
    const regexId = message.embeds[0].data.fields[0].value;
    const id = regexId.match(pattern)[1];
    if (`${interaction.user.id}` === `${id}`) {
      await interaction.reply({
        content: "Sorry, You can't use this button!",
        ephemeral: true,
      });
      return;
    }
    const createTicket = async (number) => {
      const ticketno = number ? number : "\u200B";
      try {
        let member = await interaction.guild.members.fetch(id).catch((err) => {
          return interaction.reply({
            content: "Unknown Member",
            ephemeral: true,
          });
        });
        const channel = await interaction.guild.channels.create({
          name: `${interaction.channel.name}-${ticketno}`,
          type: ChannelType.GuildText,
          parent: ticketCategory,
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: member,
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
          ],
        });
        const embed = new EmbedBuilder()
          .setColor("Random")
          .setAuthor({
            name: `Ticket opened by ${user.username}`,
            iconURL: `${user.displayAvatarURL({ dynamic: true })}`,
          })
          .addFields(
            { name: "Opened for", value: ` ${member}` },
            { name: "MessageID", value: `${interaction.message.id}` },
            { name: "ChannelID", value: `${interaction.channel.id}` }
          )
          .setFooter({ text: "Close the ticket - Staff Only", iconURL: null })
          .setThumbnail(`${user.displayAvatarURL({ dynamic: true })}`)
          .setTimestamp();
        console.log(interaction.message.id);
        const close = new ButtonBuilder()
          .setCustomId("close")
          .setLabel("Close the Ticket")
          .setStyle(ButtonStyle.Danger);
        const resolve = new ButtonBuilder()
          .setCustomId("resolve")
          .setLabel("Resolve the Ticket")
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(close, resolve);
        //send embed
        await channel.send({
          embeds: [embed],
          components: [row],
        });
        await interaction.reply({
          content: `Ticket ${channel} has been created.`,
          ephemeral: true,
        });
      } catch (error) {
        console.log(error);
      }
    };
    try {
      const check = await ticketSchema.findOne({
        messageID: interaction.message.id,
      });

      // console.log(check);
      if (!check) {
        const create = await ticketSchema.create({
          messageID: interaction.message.id,
          userIDs: interaction.user.id,
          number: 1,
        });

        // console.log(create);
        createTicket();
        return;
      }
      if (check.userIDs.includes(interaction.user.id)) {
        await interaction.reply({
          content: "You have already availed the chance!",
          ephemeral: true,
        });
        return;
      }
      await check.updateOne({
        $push: {
          userIDs: interaction.user.id,
        },
      });
      const dbNumber = check.number;
      if (dbNumber === 4) {
        createTicket(dbNumber);
        //disable button
        const components = message.components[0].components.map((c) =>
          ButtonBuilder.from(c).setDisabled(true)
        );
        const row = new ActionRowBuilder().addComponents(components);
        await message.edit({
          components: [row],
        });
        return;
      }
      createTicket(dbNumber);
      const number = dbNumber + 1;
      const result = await check.updateOne({ number: number });
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
    } catch (error) {
      console.log(error);
    }
  } else if (interaction.customId === "close") {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      await interaction.reply({
        content: "Staff only button!",
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: "Closing the ticket...",
      ephemeral: true,
    });
    setTimeout(async () => {
      await interaction.channel.delete();
    }, 1000);
  } else if (interaction.customId === "resolve") {
    const member = interaction.message.embeds[0].data.fields[0].value;
    const message_id = interaction.message.embeds[0].data.fields[1].value;
    const channelID = interaction.message.embeds[0].data.fields[2].value;

    const pattern = /<@(\d+)>/;

    const id = member.match(pattern)[1];

    if (interaction.user.id !== id) {
      await interaction.reply({
        content: "You can't use this button",
        ephemeral: true,
      });
      return;
    }
    try {
      const channel = await interaction.guild.channels.fetch(channelID);
      const message = await channel.messages
        .fetch(message_id)
        .catch(async () => {
          await interaction.reply({
            content: "The post doesnt exist anymore.",
            ephemeral: true,
          });
        });

      await message.delete();
      await interaction.reply({
        content: "The ticket has been resolved and the post by you is deleted!",
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
    }
  }
  // console.log(interaction);
};
