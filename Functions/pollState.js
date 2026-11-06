// Serialize Discord message edits within this process; votes themselves live in MongoDB.
module.exports = { pending: new Map() };
