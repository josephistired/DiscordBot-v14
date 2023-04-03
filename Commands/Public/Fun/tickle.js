const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");
const Tickle = require("../../../Schemas/tickle");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tickle")
    .setDescription("Tickle another user")
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
      "https://purrbot.site/api/img/sfw/tickle/gif"
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely abandoned the server.");
    } else {
      if (user.id === interaction.member.id) {
        errorsArray.push(
          "You must be extremely weird to try and tickle yourself."
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
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction
      );
    }

    try {
      const tickle = await Tickle.findOne({
        userId: interaction.member.id,
        targetId: user.id,
      });

      const count = tickle ? tickle.count : 0;

      if (tickle) {
        tickle.count++;
        await tickle.save();
      } else {
        const tickle = new Tickle({
          userId: interaction.member.id,
          targetId: user.id,
          count: 1,
        });
        await tickle.save();
      }

      const tickleCountText = count === 1 ? "time" : "times";
      const tickleEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setImage(
          `${body.link}
      `
        )
        .setColor("Green")
        .setDescription(`${member} has tickled ${user}!`)
        .setTimestamp()
        .setFooter({ text: ` Tickled ${count} ${tickleCountText}` });

      interaction.reply({ embeds: [tickleEmbed] });
    } catch (error) {
      console.error(error);
      return errorSend(
        {
          user: `${user.username}#${user.discriminator}`,
          command: `${interaction.commandName}`,
          error: `An error occurred while processing this command.`,
          time: `${parseInt(interaction.createdTimestamp / 1000, 10)}`,
        },
        interaction
      );
    }
  },
};
