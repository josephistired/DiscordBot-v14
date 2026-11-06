// Keep transient vote state separate from reloadable event modules.
module.exports = { votes: new Map(), pending: new Map() };
