const { connection } = require("mongoose");
const xp = require("simply-xp");
const Database = require("../../Schemas/links");
const Infractions = require("../../Schemas/infractions");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

const TIMEOUTS = [300, 600, 1200];
const MAX_ATTEMPTS = TIMEOUTS.length + 1;

module.exports = {
  name: "messageCreate",
  async execute(message) {
    try {
      const { author, content, guild, member, channel } = message;
      const discordLinkRegex =
        /discord(?:app)?\.(?:com|gg)\/(?:invite\/)?([a-zA-Z0-9-]+)/;

      if (author.bot || connection.readyState === 0) {
        return;
      }

      xp.addXP(message, author.id, guild.id, { min: 50, max: 2 });

      const settings = await Database.findOneAndUpdate(
        { Guild: guild.id },
        { Guild: guild.id, discordLinks: true },
        { upsert: true, new: true }
      );

      if (!settings.discordLinks || member.permissions.has("Administrator")) {
        return;
      }

      if (!discordLinkRegex.test(content)) {
        return;
      }

      const authorId = author.id;
      const guildId = guild.id;
      const infraction = await Infractions.findOneAndUpdate(
        { Guild: guildId, User: authorId },
        {
          Guild: guildId,
          User: authorId,
          $inc: { linkCount: 1 },
          lastInfraction: Date.now(),
        },
        { upsert: true, new: true }
      );

      if (infraction.linkCount === MAX_ATTEMPTS) {
        await member.ban({ reason: "Posted Links." });
        await moderationlogSend(
          {
            action: "Ban",
            moderator: `Anti-Link System`,
            user: `${author.username}`,
            reason: `Discord Invite - Max Infractions`,
            link: content.toLowerCase(),
          },
          message
        );
        await Infractions.delete({ Guild: guildId, User: authorId });
        return;
      }

      const timeoutDuration = TIMEOUTS[infraction.linkCount - 1];
      const timeoutMs = timeoutDuration * 1000;

      const timeoutMessage = await channel.send(
        `Sorry ${author}, sending Discord invites is not allowed in ${
          guild.name
        }. You have been timed out for ${timeoutDuration / 60} minutes.`
      );

      const deleteMessage = async (message) => {
        setTimeout(() => {
          message.delete();
        }, 5000);
      };

      await deleteMessage(timeoutMessage);
      await member.timeout(timeoutMs);
      await message.delete();
      await moderationlogSend(
        {
          action: "Link Timeout",
          moderator: `Anti-Link System`,
          user: `${author.username}`,
          reason: `Discord Invite - ${infraction.linkCount}th Infraction`,
          duration: `${timeoutDuration / 60}`,
          link: content.toLowerCase(),
        },
        message
      );
    } catch (error) {
      console.error(`Error in messageCreate event: ${error}`);
    }
  },
};
