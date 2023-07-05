const { Client, IntentsBitField, Partials } = require("discord.js");
const WOK = require("wokcommands");
const path = require("path");
const config = require("./config.json");
const token = config.token;
const mongoose = require("mongoose");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.on("ready", async () => {
  console.log("running");
  await mongoose.connect(
    "mongodb+srv://bilal:ihackedwifi240@cluster0.aabkgux.mongodb.net/?retryWrites=true&w=majority",
    {
      keepAlive: true,
    }
  );
  new WOK({
    // The client for your bot. This is the only required property
    client,
    // Path to your commands folder
    commandsDir: path.join(__dirname, "commands"),
    // Path to your features folder
    featuresDir: path.join(__dirname, "features"),
    // Configure your event handlers
    events: {
      // Where your events are located. This is required if you
      // provide this events object
      dir: path.join(__dirname, "events"),
      // To learn how to properly configure your events please see
      // https://docs.wornoffkeys.com/events/what-is-a-feature
    },
    // Your MongoDB connection URI
    // mongoUri:
    //   "mongodb+srv://bilal:ihackedwifi240@cluster0.aabkgux.mongodb.net/?retryWrites=true&w=majority",
    // What server IDs are for testing. This is where test
    // only commands are registered to
    // testServers: ["TEST_SERVER_ID_HERE"],
    // User IDs who are bot owners/developers. These users
    // can access owner only commands
    // botOwners: ["YOUR_DISCORD_ID_HERE"],
    // Don't want some of the default commands? Add them here
    disabledDefaultCommands: [
      // DefaultCommands.ChannelCommand,
      // DefaultCommands.CustomCommand,
      // DefaultCommands.Prefix,
      // DefaultCommands.RequiredPermissions,
      // DefaultCommands.RequiredRoles,
      // DefaultCommands.ToggleCommand
    ],
    // Configure the cooldowns for your commands and features
    cooldownConfig: {
      errorMessage: "Please wait {TIME} before doing that again.",
      botOwnersBypass: false,
      // The amount of seconds required for a cooldown to be
      // persistent via MongoDB.
      dbRequired: 300,
    },
  });
});

client.login(token);
