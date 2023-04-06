const { EmbedBuilder, AttachmentBuilder, GuildMember } = require("discord.js");

const logDatabase = require("../Schemas/logs");

async function commandlogSend({ time, place, command }, interaction) {
  try {
    const data = await logDatabase.findOne({ Guild: interaction?.guild?.id });
    if (!data) return;

    const attachment = new AttachmentBuilder("assets/user.png");

    const channel = interaction.guild.channels.cache.get(data.logChannel);

    const commandEmbed = new EmbedBuilder()
      .setTitle("💬 Command Log 💬")
      .setAuthor({
        name: `${interaction.user.tag} | ${interaction.user.id}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      })
      .setColor("Green")
      .setThumbnail("attachment://user.png")
      .addFields(
        {
          name: "👤 User:",
          value: `${interaction.user}`,
        },
        {
          name: "💬 Command:",
          value: `${command}`,
        },
        {
          name: "❔ Channel:",
          value: `  ${place}`,
        },
        {
          name: "⏲️ Command Executed:",
          value: `<t:${time}:D> | <t:${time}:R>`,
        }
      )
      .setFooter({ text: "📩 Command Executed" })
      .setTimestamp();

    channel.send({ embeds: [commandEmbed], files: [attachment] });
  } catch (error) {
    console.error(error);
  }
}

module.exports = { commandlogSend };
