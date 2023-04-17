const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  username: String,
  password: String,
  notifications: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('admins', TaskSchema);
