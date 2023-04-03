const { GiveawaysManager } = require("discord-giveaways");
const giveawayModel = require("../Schemas/giveaway");

class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
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
