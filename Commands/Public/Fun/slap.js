const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");
const Slap = require("../../../Schemas/slap");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slap")
    .setDescription("Slap another user")
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
      "https://purrbot.site/api/img/sfw/slap/gif"
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely abandoned the server.");
    } else {
      if (user.id === interaction.member.id) {
        errorsArray.push(
          "You must be extremely weird to try and slap yourself."
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
      const slap = await Slap.findOne({
        userId: interaction.member.id,
        targetId: user.id,
      });

      let count = slap ? slap.count : 0;

      if (slap) {
        slap.count++;
        await slap.save();
      } else {
        let slap = new Slap({
          userId: interaction.member.id,
          targetId: user.id,
          count: 1,
        });
        await slap.save();
      }

      const slapCountText = count === 1 ? "time" : "times";
      const slapEmbed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setImage(
          `${body.link}
      `
        )
        .setColor("Green")
        .setDescription(`${member} has slaped ${user}!`)
        .setTimestamp()
        .setFooter({ text: ` slaped ${count} ${slapCountText}` });

      interaction.reply({ embeds: [slapEmbed] });
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
