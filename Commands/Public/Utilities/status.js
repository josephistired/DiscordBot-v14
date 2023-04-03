//  GNU General Public License v3.0 - https://www.gnu.org/licenses/gpl-3.0.en.html
//  Developed by Kevin Foged, 1st of October 2022 - https://github.com/KevinFoged

const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  UserFlags,
  version,
} = require("discord.js");

const { connection } = require("mongoose");
const os = require("os");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Displays the bot's and database connection's status!")
    .setDMPermission(false),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const status = [
      "Disconnected ❌",
      "Connected ✅",
      "Connecting 🔃",
      "Disconnecting 🔚",
    ];

    await client.user.fetch();
    await client.application.fetch();

    const getChannelTypeSize = (type) =>
      client.channels.cache.filter((channel) => type.includes(channel.type))
        .size;

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(interaction.guild.members.me.roles.highest.hexColor)
          .setTitle(`${client.user.username}'s Status`)
          .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
          .addFields(
            {
              name: "General",
              value: [
                `👩🏻‍🔧 **Client:** ${client.user.tag}`,
                `💳 **ID:** ${client.user.id}`,
                `📆 **Created: ** <t:${parseInt(
                  client.user.createdTimestamp / 1000,
                  10
                )}:R>`,
                `👩🏻‍🔧 **Developer:** joseph#5678`,
                `👑 **Owner:** ${
                  client.application.owner
                    ? `<@${client.application.owner.id}> (${client.application.owner.tag})`
                    : "None"
                }`,
                `✅ **Verified:** ${
                  client.user.flags & UserFlags.VerifiedBot ? "Yes" : "No"
                }`,
                `💬 **Commands:** ${client.commands.size}`,
              ].join("\n"),
            },
            {
              name: "System",
              value: [
                `🖥 **Operating System:** ${os
                  .type()
                  .replace("Windows_NT", "Windows")
                  .replace("Darwin", "macOS")}`,
                `⏰ **Up Since:** <t:${parseInt(
                  client.readyTimestamp / 1000,
                  10
                )}:R>`,
                `🏓 **Ping:** ${client.ws.ping}ms`,
                `🧠 **CPU Model:** ${os.cpus()[0].model}`,
                `💾 **CPU Usage:** ${(
                  process.memoryUsage().heapUsed /
                  1024 /
                  1024
                ).toFixed(2)}%`,
                `📚 **Database Status:** ${status[connection.readyState]}`,
                `👩🏻‍🔧 **Node.js Version:** ${process.version}`,
                `🛠 **Discord.js Version:** ${version}`,
              ].join("\n"),
              inline: true,
            },
            {
              name: "Statistics",
              value: [
                `🌍 **Servers:** ${client.guilds.cache.size}`,
                `👨‍👩‍👧‍👦 **Users:** ${client.users.cache.size}`,
                `😏 **Emojis:** ${client.emojis.cache.size}`,
                `💬 **Text Channels:** ${getChannelTypeSize([
                  ChannelType.GuildText,
                  ChannelType.GuildForum,
                  ChannelType.GuildNews,
                ])}`,
                `🎙 **Voice Channels:** ${getChannelTypeSize([
                  ChannelType.GuildVoice,
                  ChannelType.GuildStageVoice,
                ])}`,
                `🧵 **Threads:** ${getChannelTypeSize([
                  ChannelType.GuildPublicThread,
                  ChannelType.GuildPrivateThread,
                  ChannelType.GuildNewsThread,
                ])}`,
              ].join("\n"),
              inline: true,
            }
          ),
      ],
      ephemeral: true,
    });
  },
};
