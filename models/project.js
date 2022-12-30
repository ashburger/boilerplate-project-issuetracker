const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const projectSchema = mongoose.Schema({
  name: {type:String, required:true, unique:true}
}, {strictQuery: true});

projectSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Project', projectSchema);