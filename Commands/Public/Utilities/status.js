const {
  MessageFlags,
  InteractionContextType,
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  UserFlags,
  version,
} = require("discord.js");
const { connection } = require("mongoose");
const os = require("node:os");
module.exports = {
  requiresDatabase: false,
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Displays the bot's and database connection's status!")
    .setContexts(InteractionContextType.Guild),
  async execute(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    const memory = process.memoryUsage();
    const count = (...types) =>
      client.channels.cache.filter((channel) => types.includes(channel.type))
        .size;
    const owner = client.application.owner;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`${client.user.username}'s Status`)
      .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
      .addFields(
        {
          name: "General",
          value: [
            `Client: ${client.user.tag}`,
            `ID: ${client.user.id}`,
            `Owner: ${owner?.name ?? owner?.tag ?? "Unavailable"}`,
            `Verified: ${client.user.flags?.has(UserFlags.VerifiedBot) ? "Yes" : "No"}`,
            `Commands: ${client.commands.size}`,
          ].join("\n"),
        },
        {
          name: "System",
          value: [
            `OS: ${os.type()}`,
            `Up since: <t:${Math.floor(client.readyTimestamp / 1000)}:R>`,
            `Gateway latency: ${client.ws.ping < 0 ? "Unavailable" : `${client.ws.ping} ms`}`,
            `CPU model: ${os.cpus()[0]?.model ?? "Unavailable"}`,
            `Heap used: ${(memory.heapUsed / 1024 / 1024).toFixed(1)} MiB`,
            `Process memory (RSS): ${(memory.rss / 1024 / 1024).toFixed(1)} MiB`,
            `Database: ${states[connection.readyState] ?? "Unknown"}`,
            `Node.js: ${process.version}`,
            `Discord.js: ${version}`,
          ].join("\n"),
        },
        {
          name: "Cached statistics",
          value: [
            `Servers: ${client.guilds.cache.size}`,
            `Users: ${client.users.cache.size}`,
            `Text/announcement channels: ${count(ChannelType.GuildText, ChannelType.GuildAnnouncement)}`,
            `Forum/media channels: ${count(ChannelType.GuildForum, ChannelType.GuildMedia)}`,
            `Voice channels: ${count(ChannelType.GuildVoice, ChannelType.GuildStageVoice)}`,
            `Threads: ${count(ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread)}`,
          ].join("\n"),
        },
      );
    await interaction.editReply({ embeds: [embed] });
  },
};
