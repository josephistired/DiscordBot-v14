const { Message } = require("discord.js");
const { connection } = require("mongoose");
const Database = require("../../Schemas/links");
const Infractions = require("../../Schemas/infractions");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

const TIMEOUTS = [300, 600, 1200]; // in seconds
const MAX_ATTEMPTS = TIMEOUTS.length + 1;

module.exports = {
  name: "messageUpdate",

  async execute(oldMessage, newMessage, message) {
    try {
      if (newMessage.author.bot) {
        return;
      }

      if (connection.readyState === 0) {
        return;
      }

      const settings = await Database.findOneAndUpdate(
        { Guild: newMessage.guild.id },
        { Guild: newMessage.guild.id, discordLinks: true },
        { upsert: true, new: true },
      );

      if (
        !settings.discordLinks ||
        newMessage.member.permissions.has("Administrator")
      ) {
        return;
      }

      const discordLinkRegex =
        /discord(?:app)?\.(?:com|gg)\/(?:invite\/)?([a-zA-Z0-9-]+)/;
      if (!discordLinkRegex.test(newMessage.content)) {
        return;
      }

      const {
        author,
        author: { id },
        guild: { id: guildId },
        content,
        channel,
        member,
      } = newMessage;

      const infraction = await Infractions.findOneAndUpdate(
        { Guild: guildId, User: id },
        {
          Guild: guildId,
          User: id,
          $inc: { linkCount: 1 },
          lastInfraction: Date.now(),
        },
        { upsert: true, new: true },
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
          message,
        );

        await Infractions.delete({ Guild: guildId, User: id });
        return;
      }

      const timeoutDuration = TIMEOUTS[infraction.linkCount - 1];
      const timeoutMs = timeoutDuration * 1000;

      const timeoutMessage = `Sorry ${author}, editing messages to show Discord invites is not allowed in ${
        newMessage.guild.name
      }. You have been timed out for ${timeoutDuration / 60} minutes.`;

      const timeoutMsg = await channel.send(timeoutMessage);

      setTimeout(() => {
        timeoutMsg.delete();
      }, 5000);

      await member.timeout(timeoutMs);
      await newMessage.delete();

      await moderationlogSend(
        {
          action: "Link Timeout",
          moderator: "Anti-Link System",
          user: `${newMessage.author.username}`,
          reason: `Discord Invite - ${infraction.linkCount}th Infraction`,
          duration: `${timeoutDuration / 60}`,
          link: newMessage.content.toLowerCase(),
        },
        newMessage,
      );
    } catch (error) {
      console.error(`Error in messageUpdate event: ${error}`);
    }
  },
};
