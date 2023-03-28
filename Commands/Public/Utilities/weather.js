const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const weather = require("weather-js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Weather information for a specific location")
    .addStringOption((options) =>
      options
        .setName("degree-type")
        .setDescription("Select a Temperature Unit")
        .setRequired(true)
        .setChoices(
          {
            name: "Celsius",
            value: "C",
          },
          {
            name: "Fahrenheit",
            value: "F",
          }
        )
    )
    .addStringOption((options) =>
      options
        .setName("location")
        .setDescription("Please enter the location's name or zip code.")
        .setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const type = interaction.options.getString("degree-type");
    const L = interaction.options.getString("location");

    const errorsArray = [];

    const errorEmbed = new EmbedBuilder()
      .setTitle("⛔ Error executing command")
      .setColor("Red")
      .setImage("https://media.tenor.com/fzCt8ROqlngAAAAM/error-error404.gif");

    try {
      switch (type) {
        case "C":
          {
            weather.find(
              { search: L, degreeType: "C" },
              function (error, result) {
                if (error) errorsArray.push(error);
                if (result === undefined)
                  errorsArray.push("Invalid location provided!");

                if (errorsArray.length)
                  return interaction.reply({
                    embeds: [
                      errorEmbed.addFields(
                        {
                          name: "User:",
                          value: `\`\`\`${interaction.user.username}\`\`\``,
                        },
                        {
                          name: "Reasons:",
                          value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
                        }
                      ),
                    ],
                    ephemeral: true,
                  });

                const current = result[0].current;
                const location = result[0].location;

                const Cembed = new EmbedBuilder()
                  .setTitle(
                    `Here is your weather forecast for **${location.name}**!`
                  )
                  .setAuthor({
                    name: `${interaction.member.user.tag}`,
                    iconURL: `${interaction.user.displayAvatarURL()}`,
                  })
                  .setTimestamp()
                  .setThumbnail(current.imageUrl)
                  .setColor("Green")
                  .addFields(
                    {
                      name: "⏲️ Timezone:",
                      value: `\`\`\`UTC${location.timezone}\`\`\``,
                    },
                    {
                      name: "℃ Unit Of Temperature:",
                      value: `\`\`\`Celsius\`\`\``,
                    },
                    {
                      name: "🌡️ Temperature:",
                      value: `\`\`\`${current.temperature}\`\`\``,
                    },
                    {
                      name: "😤 Feels Like:",
                      value: `\`\`\`${current.feelslike}\`\`\``,
                    },
                    {
                      name: "▶️ Current Condition:",
                      value: `\`\`\`${current.skytext}\`\`\``,
                    },
                    {
                      name: "💦 Humidity:",
                      value: `\`\`\`${current.humidity}\`\`\``,
                    },
                    {
                      name: "💨 Wind",
                      value: `\`\`\`${current.winddisplay}\`\`\``,
                    }
                  );

                interaction.reply({
                  embeds: [Cembed],
                  ephemeral: false, // Everyone can see this embed, change this to true if you don't want that.
                  components: [
                    new ActionRowBuilder().setComponents(
                      new ButtonBuilder()
                        .setLabel("Weather NPM Package")
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://www.npmjs.com/package/weather-js")
                    ),
                  ],
                });
              }
            );
          }
          break;
        case "F": {
          weather.find(
            { search: L, degreeType: "F" },
            function (error, result) {
              if (error) errorsArray.push(error);
              if (result === undefined || result === 0)
                errorsArray.push("Invalid location provided!");

              if (errorsArray.length)
                return interaction.reply({
                  embeds: [
                    errorEmbed.addFields(
                      {
                        name: "User:",
                        value: `\`\`\`${interaction.user.username}\`\`\``,
                      },
                      {
                        name: "Reasons:",
                        value: `\`\`\`${errorsArray.join("\n")}\`\`\``,
                      }
                    ),
                  ],
                  ephemeral: true,
                });

              const current = result[0].current;
              const location = result[0].location;

              const Cembed = new EmbedBuilder()
                .setTitle(
                  `Here is your weather forecast for **${location.name}**!`
                )
                .setAuthor({
                  name: `${interaction.member.user.tag}`,
                  iconURL: `${interaction.user.displayAvatarURL()}`,
                })
                .setTimestamp()
                .setThumbnail(current.imageUrl)
                .setColor("Green")
                .addFields(
                  {
                    name: "⏲️ Timezone:",
                    value: `\`\`\`UTC${location.timezone}\`\`\``,
                  },
                  {
                    name: "℉ Unit Of Temperature:",
                    value: `\`\`\`Fahrenheit\`\`\``,
                  },
                  {
                    name: "🌡️ Temperature:",
                    value: `\`\`\`${current.temperature}\`\`\``,
                  },
                  {
                    name: "😤 Feels Like:",
                    value: `\`\`\`${current.feelslike}\`\`\``,
                  },
                  {
                    name: "▶️ Current Condition:",
                    value: `\`\`\`${current.skytext}\`\`\``,
                  },
                  {
                    name: "💦 Humidity:",
                    value: `\`\`\`${current.humidity}\`\`\``,
                  },
                  {
                    name: "💨 Wind",
                    value: `\`\`\`${current.winddisplay}\`\`\``,
                  }
                );

              interaction.reply({
                embeds: [Cembed],
                ephemeral: false, // Everyone can see this embed, change this to true if you don't want that.
                components: [
                  new ActionRowBuilder().setComponents(
                    new ButtonBuilder()
                      .setLabel("Weather NPM package")
                      .setStyle(ButtonStyle.Link)
                      .setURL("https://www.npmjs.com/package/weather-js")
                  ),
                ],
              });
            }
          );
        }
      }
    } catch (err) {
      await interaction.reply({
        content: `${err} has occured! Please try again later! If that doesn't work, contact the developer! Use /info`,
      });
    }
  },
};
