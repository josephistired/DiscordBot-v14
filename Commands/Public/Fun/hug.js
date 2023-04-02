const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const superagent = require("superagent");

const { errorSend } = require("../../../Functions/errorlogSend");
const Hug = require("../../../Schemas/hug");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Hug another user")
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
      "https://purrbot.site/api/img/sfw/hug/gif"
    );

    const user = interaction.options.getMember("user");
    const member = interaction.user.username;

    const errorsArray = [];

    if (!user) {
      errorsArray.push("The user has most likely abandoned the server.");
    } else {
      if (user.id === interaction.member.id) {
        errorsArray.push(
          "You must be extremely lonely to try and hug yourself."
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
      const hug = await Hug.findOne({
        userId: interaction.member.id,
        targetId: user.id,
      });

      let count = hug ? hug.count : 0;

      if (hug) {
        hug.count++;
        await hug.save();
      } else {
        let hug = new Hug({
          userId: interaction.member.id,
          targetId: user.id,
          count: 1,
        });
        await hug.save();
      }

      const hugCountText = count === 1 ? "time" : "times";
      const hugembed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.member.user.tag}`,
          iconURL: `${interaction.member.displayAvatarURL()}`,
        })
        .setColor("Green")
        .setDescription(`${member} has hugged ${user}!`)
        .setImage(
          `${body.link}
    `
        )
        .setTimestamp()
        .setFooter({ text: ` Hugged ${count} ${hugCountText}` });

      interaction.reply({
        embeds: [hugembed],
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
