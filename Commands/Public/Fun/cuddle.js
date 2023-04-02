const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");
const Cuddle = require("../../../Schemas/cuddle");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cuddle")
    .setDescription("Cuddle another user")
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
      "https://purrbot.site/api/img/sfw/cuddle/gif"
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely left the server.");
    } else {
      if (user.id === interaction.member.id) {
        errorsArray.push(
          "You must be extremely lonely to try and cuddle with yourself."
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
      const cuddle = await Cuddle.findOne({
        userId: interaction.member.id,
        targetId: user.id,
      });

      let count = cuddle ? cuddle.count : 0;

      if (cuddle) {
        cuddle.count++;
        await cuddle.save();
      } else {
        let cuddle = new Cuddle({
          userId: interaction.member.id,
          targetId: user.id,
          count: 1,
        });
        await cuddle.save();
      }

      const cuddleCountText = count === 1 ? "time" : "times";
      const cuddleEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setImage(
          `${body.link}
      `
        )
        .setColor("Green")
        .setDescription(`${member} has cuddled ${user}!`)
        .setTimestamp()
        .setFooter({ text: ` Cuddled ${count} ${cuddleCountText}` });

      interaction.reply({ embeds: [cuddleEmbed] });
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
