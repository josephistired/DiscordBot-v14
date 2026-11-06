const { GiveawaysManager } = require("discord-giveaways");
const giveawayModel = require("../Schemas/giveaway");

class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
  constructor(client, options) {
    // Defer the dependency's documented manual initialization until clientReady.
    super(client, options, false);
  }

  async initialize() {
    if (!this.client.readyAt)
      throw new Error("Giveaways must initialize after clientReady");
    if (!this.initialization) this.initialization = super._init();
    return this.initialization;
  }

  async getAllGiveaways() {
    return giveawayModel.find().lean().exec();
  }

  async saveGiveaway(messageId, giveawayData) {
    await giveawayModel.create(giveawayData);

    return true;
  }

  async editGiveaway(messageId, giveawayData) {
    await giveawayModel.updateOne({ messageId }, giveawayData).exec();

    return true;
  }

  async deleteGiveaway(messageId) {
    await giveawayModel.deleteOne({ messageId }).exec();

    return true;
  }
}

module.exports = GiveawayManagerWithOwnDatabase;
