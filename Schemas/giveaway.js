const { model, Schema } = require("mongoose");

module.exports = model(
  "Giveaway",
  new Schema(
    {
      messageId: String,
      channelId: String,
      guildId: String,
      startAt: Number,
      endAt: Number,
      ended: Boolean,
      winnerCount: Number,
      prize: String,
      messages: {
        giveaway: String,
        giveawayEnded: String,
        title: String,
        inviteToParticipate: String,
        drawing: String,
        dropMessage: String,
        winMessage: String,
        embedFooter: String,
        noWinner: String,
        winners: String,
        endedAt: String,
        hostedBy: String,
      },
      thumbnail: String,
      image: String,
      hostedBy: String,
      winnerIds: { type: [String], default: undefined },
      reaction: String,
      botsCanWin: Boolean,
      embedColor: String,
      embedColorEnd: String,
      exemptPermissions: { type: [], default: undefined },
      exemptMembers: String,
      bonusEntries: String,
      extraData: String,
      lastChance: {
        enabled: Boolean,
        content: String,
        threshold: Number,
        embedColor: String,
      },
      pauseOptions: {
        isPaused: Boolean,
        content: String,
        unPauseAfter: Number,
        embedColor: String,
        durationAfterPause: Number,
        infiniteDurationText: String,
      },
      isDrop: Boolean,
      allowedMentions: {
        parse: { type: [String], default: undefined },
        users: { type: [String], default: undefined },
        roles: { type: [String], default: undefined },
      },
    },
    { id: false }
  )
);
