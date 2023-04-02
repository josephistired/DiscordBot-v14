const { Message } = require("discord.js");
const { connection } = require("mongoose");
const xp = require("simply-xp");
const Database = require("../../Schemas/links");
const Infractions = require("../../Schemas/infractions");
const { moderationlogSend } = require("../../Functions/moderationlogSend");

const TIMEOUTS = [5 * 60, 10 * 60, 20 * 60];
const MAX_ATTEMPTS = TIMEOUTS.length + 1;
module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   */
  async execute(message) {
    if (message.author.bot) return;

    if (connection === 0) return;

    //xp.addXP(message, message.author.id, message.guild.id, {
    //min: 50,
    //max: 2,
    //});

    let settings = await Database.findOne({ Guild: message.guild.id });

    if (!settings) {
      settings = new Database({
        Guild: message.guild.id,
        discordLinks: true,
      });
      await settings.save();
    }

    const discordLinksEnabled = settings.discordLinks;
    if (
      discordLinksEnabled &&
      !message.member.permissions.has("Administrator")
    ) {
      const discordLinkRegex =
        /discord(?:app)?\.(?:com|gg)\/(?:invite\/)?([a-zA-Z0-9-]+)/;
      if (discordLinkRegex.test(message.content)) {
        const authorId = message.author.id;
        const guildId = message.guildId;
        const number = await Infractions.findOne({
          Guild: guildId,
          User: authorId,
        });

        if (!number) {
          const timeoutDuration = TIMEOUTS[0];
          const timeoutMs = timeoutDuration * 1000;
          await message.channel
            .send(
              `Sorry ${
                message.author
              }, sending Discord invites is not allowed in ${
                message.guild.name
              }. You have been timed out for ${timeoutDuration / 60} minutes.`
            )
            .then((msg) => {
              setTimeout(() => {
                msg.delete();
              }, 5000);
            });
          await message.member.timeout(timeoutMs);
          await message.delete();
          await moderationlogSend(
            {
              action: "Link Timeout",
              moderator: `Anti-Link System`,
              user: `${message.author.username}`,
              reason: `Discord Invite - 1st Infraction`,
              duration: `${timeoutDuration / 60}`,
              link: `${message.content.toLocaleLowerCase()}`,
            },
            message
          );
          await Infractions.create({
            Guild: guildId,
            User: authorId,
            linkCount: 1,
            lastInfraction: Date.now(),
          });
          return;
        }

        if (number.linkCount < MAX_ATTEMPTS - 1) {
          const attempts = number.linkCount + 1;
          const timeoutDuration = TIMEOUTS[attempts - 1];
          const timeoutMs = timeoutDuration * 1000;
          await message.channel
            .send(
              `Sorry ${
                message.author
              }, sending Discord invites is not allowed in ${
                message.guild.name
              }. You have been timed out for ${timeoutDuration / 60} minutes.`
            )
            .then((msg) => {
              setTimeout(() => {
                msg.delete();
              }, 5000);
            });
          await message.member.timeout(timeoutMs);
          await message.delete();
          await moderationlogSend(
            {
              action: "Link Timeout",
              moderator: `Anti-Link System`,
              user: `${message.author.username}`,
              reason: `Discord Invite - ${attempts}th Infraction`,
              duration: `${timeoutDuration / 60}`,
              link: `${message.content.toLocaleLowerCase()}`,
            },
            message
          );
          await Infractions.findOneAndUpdate(
            { Guild: guildId, User: authorId },
            {
              $inc: { linkCount: 1 },
              $set: {
                lastInfraction: Date.now(),
              },
            }
          );
          return;
        }

        await message.member.ban({ reason: "Posted Links." });
        await moderationlogSend(
          {
            action: "Ban",
            moderator: `Anti-Link System`,
            user: `${message.author.username}`,
            reason: `Discord Invite - Max Infractions`,
            link: `${message.content.toLocaleLowerCase()}`,
          },
          message
        );
        await Infractions.deleteOne({ Guild: guildId, User: authorId });
        return;
      }
    }
  },
};
