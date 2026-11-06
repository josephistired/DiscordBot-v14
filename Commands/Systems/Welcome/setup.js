const { validateConfigChannel } = require("../../../Functions/configChannel");
const {
  MessageFlags,
  EmbedBuilder,
  ChatInputCommandInteraction,
} = require("discord.js");
const Database = require("../../../Schemas/welcome");

module.exports = {
  subCommand: "welcome.setup",
  /**
   * @param {ChatInputCommandInteraction} interaction
   *
   */
  async execute(interaction) {
    const { options } = interaction;

    const channelObject = options.getChannel("welcome-channel");
    const roleObject = options.getRole("welcome-role");
    const messageObject = options.getString("welcome-message");
    const colorObject = options.getString("welcome-color");

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const me = await validateConfigChannel(interaction, channelObject);
    if (
      !me.permissions.has(require("discord.js").PermissionFlagsBits.ManageRoles)
    ) {
      throw new Error("The bot needs Manage Roles to assign welcome roles.");
    }
    if (
      !roleObject ||
      roleObject.id === interaction.guildId ||
      roleObject.managed ||
      me.roles.highest.comparePositionTo(roleObject) <= 0
    ) {
      throw new Error("Choose an unmanaged role below the bot's highest role.");
    }

    await Database.findOneAndUpdate(
      { Guild: interaction.guild.id },
      {
        welcomeChannel: channelObject.id,
        welcomeMessage: messageObject,
        welcomeColor: colorObject,
        welcomeRole: roleObject.id,
      },
      {
        new: true,
        upsert: true,
      },
    );

    const success = new EmbedBuilder()
      .setColor("Green")
      .setDescription("Successfully setup the welcome system!")
      .addFields({
        name: "Channel:",
        value: channelObject.name,
      });

    await interaction.editReply({
      embeds: [success],
    });
  },
};
