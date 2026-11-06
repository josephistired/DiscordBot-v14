const { Events, MessageFlags } = require("discord.js");
const { verifyMember } = require("../../Functions/verification");
module.exports = {
  name: Events.InteractionCreate,
  async execute(i) {
    if (!i.isButton() || i.customId !== "verification:verify") return;
    await i.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await i.editReply(await verifyMember(i));
    } catch (error) {
      console.error("Verification failed:", error);
      await i.editReply(
        "Verification is unavailable or this panel is inactive. Ask a server moderator to check the setup.",
      );
    }
  },
};
