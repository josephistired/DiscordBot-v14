// Below will show you how to create command, and reply with a simple message.
// This command example will say hi back to the user.
// Make sure all the commands you want to create are in the Commands folder. They can be in a sub folder in the Commands Folder.

const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js"); // You need ChatInputCommandInteraction, SlashCommandBuilder from discord.js whenever you create a new command. In this example, we also need PermissionFlagsBits.

module.exports = {
  // REQUIRED EVERY COMMAND
  data: new SlashCommandBuilder(), // REQUIRED EVERY NEW COMMAND
  developer: false // I am setting this to false, however if you only wanted to see a command & execute it you write this line however write true. Make sure to delcare your id in the Events/Interaction/SlashCommand.js file.
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages) // This sets the permission the member must have to see the command, and execute it. In my case, they just need to be able to send messages. See https://discordjs.guide/slash-commands/permissions.html#member-permissions
    .setName("hi") // You should name your command here. The command name must not contain any capital letters.
    .setDescription("Says hello to you!!"), // Here, you should write a command description.
  /**
   * @param {ChatInputCommandInteraction} // REQUIRED EVERY COMMAND TO MAKE YOUR LIFE EASY
   */
  async execute(interaction) {
    // Now we would would take in the user's input however we don't have any, so let's execute the command.

    interaction.reply(`Hello, ${interaction.user.username}!`); // Now we are executing / replying to the user.
  },
};
