const { PermissionFlagsBits } = require("discord.js");
const { connection } = require("mongoose");
const Database = require("../Schemas/links");
const Infractions = require("../Schemas/infractions");
const { moderationlogSend } = require("./moderationlogSend");
const TIMEOUTS = [300, 600, 1200];
const INVITE =
  /(?:https?:\/\/)?(?:www\.)?discord(?:app)?\.(?:com|gg)\/(?:invite\/)?[a-zA-Z0-9-]+/i;

async function enforceAntiLink(message) {
  if (connection.readyState !== 1 || !message.guild || message.author?.bot)
    return;
  if (message.partial) message = await message.fetch();
  if (
    !message.author ||
    message.author.bot ||
    !INVITE.test(message.content ?? "")
  )
    return;
  const member =
    message.member ?? (await message.guild.members.fetch(message.author.id));
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return;
  const settings = await Database.findOneAndUpdate(
    { Guild: message.guild.id },
    { $setOnInsert: { Guild: message.guild.id, discordLinks: true } },
    { upsert: true, new: true },
  );
  if (!settings.discordLinks) return;
  if (!member.moderatable) return;
  const infraction = await Infractions.findOneAndUpdate(
    { Guild: message.guild.id, User: message.author.id },
    { $inc: { linkCount: 1 }, $set: { lastInfraction: Date.now() } },
    { upsert: true, new: true },
  );
  const ban = infraction.linkCount > TIMEOUTS.length;
  const seconds = TIMEOUTS[infraction.linkCount - 1];
  if (ban) {
    if (!member.bannable)
      throw new Error(
        "The bot cannot ban this member after maximum infractions",
      );
    await member.ban({ reason: "Discord invites: maximum infractions" });
    await Infractions.deleteOne({
      Guild: message.guild.id,
      User: message.author.id,
    });
  } else {
    await member.timeout(seconds * 1000, "Discord invites are not allowed");
  }
  if (message.deletable) await message.delete();
  const notice = await message.channel.send({
    content: ban
      ? `${message.author} was banned for repeated Discord invites.`
      : `${message.author} was timed out for ${seconds / 60} minutes for posting a Discord invite.`,
    allowedMentions: { parse: [] },
  });
  setTimeout(() => notice.delete().catch(console.error), 5000).unref();
  await moderationlogSend(
    {
      action: ban ? "Ban" : "Link Timeout",
      moderator: "Anti-Link System",
      user: message.author.tag,
      reason: `Discord invite: infraction ${infraction.linkCount}`,
      duration: ban ? undefined : `${seconds / 60} minutes`,
      link: message.content.slice(0, 1024),
    },
    undefined,
    message,
  );
}
module.exports = { enforceAntiLink };
