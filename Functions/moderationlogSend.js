const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const logDatabase = require("../Schemas/logs");

async function moderationlogSend(
  {
    action,
    moderator,
    user,
    reason,
    place,
    messages,
    size,
    duration,
    total,
    transcript,
    link,
  },
  interaction,
  message,
) {
  const data = await logDatabase.findOne({
    guild: interaction.guild.id || message.guild.id,
  });

  if (!data) return;

  const attachment = new AttachmentBuilder("assets/moderation.gif");

  const channel =
    interaction.guild.channels.cache.get(data.logChannel) ||
    message.channel.channels.cache.get(data.logChannel);

  const time = parseInt(interaction.createdTimestamp / 1000, 10);

  const commandEmbed = new EmbedBuilder()
    .setTitle("🚨 Moderation Log 🚨")
    .setAuthor({
      name: `${interaction?.user?.tag ?? message?.author?.tag} | ${
        interaction?.user?.id ?? message?.author?.id
      }`,
      iconURL: (interaction?.user ?? message?.author)?.displayAvatarURL({
        dynamic: true,
      }),
    })
    .setColor("Green")
    .setThumbnail("attachment://moderation.gif")
    .addFields(
      {
        name: "🤔 Action",
        value: action,
      },
      {
        name: "👤 User Punished",
        value: user || "Not applicable",
      },
      {
        name: "🔘 Channel",
        value: place || "Not applicable",
      },
      {
        name: "❔ Reason",
        value: reason || "Not applicable",
      },
      {
        name: "🔗 Link Deleted",
        value: link || "Not applicable",
      },
      {
        name: "📅 Days Of Messages Deleted",
        value: messages || "Not applicable",
      },
      {
        name: "🔢 Total Messages Deleted",
        value: size || "Not applicable",
      },
      {
        name: "🎟️ Infraction Total",
        value: total || "Not applicable",
      },
      {
        name: "⏲️ Duration",
        value: duration || "Not applicable",
      },
      {
        name: "⌚ Command Executed",
        value: `<t:${time}:D> | <t:${time}:R>`,
      },
      {
        name: "👮🏻 Moderator",
        value: moderator || "Not applicable",
      },
    )
    .setFooter({ text: `${action} Executed` })
    .setTimestamp();

  if (transcript)
    channel.send({
      embeds: [commandEmbed],
      files: [transcript, attachment],
    });
  else channel.send({ embeds: [commandEmbed], files: [attachment] });
}

module.exports = { moderationlogSend };
