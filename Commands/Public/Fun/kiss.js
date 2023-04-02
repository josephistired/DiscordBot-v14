const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");
const Kiss = require("../../../Schemas/kiss");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kiss")
    .setDescription("Kiss another user")
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
      "https://purrbot.site/api/img/sfw/kiss/gif"
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely abandoned the server.");
    } else {
      if (user.id === interaction.member.id) {
        errorsArray.push(
          "You must be extremely lonely to try and kiss yourself."
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
      const kiss = await Kiss.findOne({
        userId: interaction.member.id,
        targetId: user.id,
      });

      let count = kiss ? kiss.count : 0;

      if (kiss) {
        kiss.count++;
        await kiss.save();
      } else {
        let kiss = new Kiss({
          userId: interaction.member.id,
          targetId: user.id,
          count: 1,
        });
        await kiss.save();
      }

      const kissCountText = count === 1 ? "time" : "times";
      const kissembed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setImage(
          `${body.link}
      `
        )
        .setColor("Green")
        .setDescription(`${member} has kissed ${user}!`)
        .setTimestamp()
        .setFooter({ text: ` Kissed ${count} ${kissCountText}` });

      interaction.reply({
        embeds: [kissembed],
      });
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
