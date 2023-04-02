const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");
const Wink = require("../../../Schemas/wink");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wink")
    .setDescription("Wink at another user")
    .setDMPermission(false)
    .addUserOption((options) =>
      options
        .setName("user")
        .setDescription("Select the user")
        .setRequired(true)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    let { body } = await superagent.get(
      "https://some-random-api.ml/animu/wink"
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely abandoned the server.");
    } else {
      if (user.id === interaction.member.id) {
        errorsArray.push(
          "You must be extremely weird to try and wink at yourself."
        );
      }

      if (body.error === true)
        errorsArray.push("The API had an error, try again later!");
    }

    if (errorsArray.length) {
      return errorSend(
        {
          user: `${member}`,
          command: `${interaction.commandName}`,
          error: `${errorsArray.join("\n")}`,
          time: `${parseInt(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }

    try {
      const wink = await Wink.findOne({
        userId: interaction.member.id,
        targetId: user.id,
      });

      let count = wink ? wink.count : 0;

      if (wink) {
        wink.count++;
        await wink.save();
      } else {
        let wink = new Wink({
          userId: interaction.member.id,
          targetId: user.id,
          count: 1,
        });
        await wink.save();
      }

      const winkCountText = count === 1 ? "time" : "times";
      const winkEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setImage(
          `${body.link}
      `
        )
        .setColor("Green")
        .setDescription(`${member} has winked ${user}!`)
        .setTimestamp()
        .setFooter({ text: ` Winked ${count} ${winkCountText}` });

      interaction.reply({ embeds: [winkEmbed] });
    } catch (error) {
      console.error(error);
      return errorSend(
        {
          user: `${user.username}#${user.discriminator}`,
          command: `${interaction.commandName}`,
          error: `An error occurred while processing this command.`,
          time: `${parseInt(interaction.createdTimestamp / 1000)}`,
        },
        interaction
      );
    }
  },
};
