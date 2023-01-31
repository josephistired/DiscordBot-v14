// Below will show you how to create command, and reply with an embed instead of a normal reply.
// This command example will give the temp of their city.
// Make sure all the commands you want to create are in the Commands folder. They can be in a sub folder in the Commands Folder.

const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js"); // You need ChatInputCommandInteraction, SlashCommandBuilder from discord.js whenever you create a new command, and you need EmbedBuilder when you create an embed. In that case, I'll be demonstrating how to generate an embed for you.

module.exports = {
  // REQUIRED EVERY COMMAND
  data: new SlashCommandBuilder() // REQUIRED EVERY NEW COMMAND
    .setName("weather") // You should name your command here. The command name must not contain any capital letters.
    .setDescription("Displays the weather for your city!") // Here, you should write a command description.
    .addStringOption(
      (
        options // This enables the user to enter data, thus if the command was /weather, I would then ask for the user's city. There are lots of choices using Discord.js.
      ) =>
        options
          .setName("city") // This would the name of the option so in my case. /weather city
          .setDescription("Provide your city name.") // Now, this is where you write a description for your command option.
          .setRequired(true) // Now, you can make this option mandatory, in my example the user won't be able to run this command until they specify their city.
    ), // Remember your commas!
  /**
   * @param {ChatInputCommandInteraction} interaction // REQUIRED EVERY COMMAND TO MAKE YOUR LIFE EASY
   */
  async execute(interaction) {
    // Now we are going to take in all the inputs and execute the command!
    const city = interaction.options.getString("city"); // I'm now taking note of the user's response and assigning a variable to it.

    const temperature = "57"; // Of course, not every city has a temperature of 57 degrees, but I'm not going to use an api or a npm module to complicate this example. If that is something you would an example on how to do (using an api) in a command. Create an issue! I'll be more happy to help.
    

    const embed = new EmbedBuilder() // Creating a new embed
      .setTitle(
        `${interaction.member.user} Here is your weather report for ${city}!`
      ) // This will be your title for your embed.
      .setColor("Red") // This will set the color of your embed.
      .setTimestamp() // This will set the timestamp that of bottom of the embed, remove it if you don't want a timestamp
      .setImage("https://cdn-icons-png.flaticon.com/512/218/218706.png") // This is where you set the image. Has to be a url or could be a local file.
      .setFooter({ text: "https://github.com/josephistired" }) // You must always use "text:" followed by the content you want in the footer.
      .setAuthor({
        name: `${interaction.member.user.tag}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      }) // In my example, I want the author to be the user and to display their avatar. This is where you say the author for the embed.
      .addFields(
        {
          name: "User", // so this would be the name of the field
          value: `\`\`\`${interaction.user.username}\`\`\``, // This will be the field's value, therefore in my case, I want the value to be the command's executioner. All the additional `\ is just extra formatting I like to use; for something more conventional, check below.
        },
        {
          name: "Weather",
          value: `${temperature}`, // this would be the conventional formatting.
        }
      ); // now we are adding fields to the embed.
      
    interaction.reply({
      // Now we are executing / replying to the user with the embed.
      embeds: [embed],
      ephemeral: true, // With this option, the reply—in this case, the embed—can only be seen by the user who issued the command.
    });
  },
};

// You're all set! That is how you create a command that uses an embed. See https://discordjs.guide/popular-topics/embeds.html#using-the-embed-constructor for additional information!
