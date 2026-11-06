const {
  SlashCommandBuilder,
  InteractionContextType,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");
const superagent = require("superagent");

function createSocialCommand({ name, past, model }) {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(`${name[0].toUpperCase() + name.slice(1)} another user`)
      .setContexts(InteractionContextType.Guild)
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("Select the user")
          .setRequired(true),
      ),
    async execute(interaction) {
      const target = interaction.options.getUser("user", true);
      if (target.id === interaction.user.id) {
        return interaction.reply({
          content: `You cannot ${name} yourself.`,
          flags: MessageFlags.Ephemeral,
        });
      }
      await interaction.deferReply();
      const { body } = await superagent
        .get(`https://purrbot.site/api/img/sfw/${name}/gif`)
        .timeout({ response: 5000, deadline: 10000 });
      if (body.error || typeof body.link !== "string")
        throw new Error("Image API returned an invalid response");
      const result = await model.findOneAndUpdate(
        { userId: interaction.user.id, targetId: target.id },
        { $inc: { count: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Green")
        .setDescription(`${interaction.user.username} has ${past} ${target}!`)
        .setImage(body.link.trim())
        .setTimestamp()
        .setFooter({
          text: `${past[0].toUpperCase() + past.slice(1)} ${result.count} ${result.count === 1 ? "time" : "times"}`,
        });
      await interaction.editReply({ embeds: [embed] });
    },
  };
}

module.exports = { createSocialCommand };
