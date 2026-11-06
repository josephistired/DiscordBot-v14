function validateTarget(interaction, target, capability) {
  if (!target) throw new Error("The user is no longer in this server.");
  if (target.id === interaction.user.id)
    throw new Error("You cannot moderate yourself.");
  if (target.id === interaction.guild.ownerId)
    throw new Error("You cannot moderate the server owner.");
  if (!target[capability])
    throw new Error(
      "The bot lacks permission or role hierarchy to moderate this user.",
    );
  if (
    interaction.user.id !== interaction.guild.ownerId &&
    interaction.member.roles.highest.comparePositionTo(target.roles.highest) <=
      0
  ) {
    throw new Error("Your highest role must be above the selected user.");
  }
}
module.exports = { validateTarget };
