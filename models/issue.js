const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Project = require('./project');
const issueSchema = mongoose.Schema({
  issue_title: {type:String, required:true, unique:false},
  issue_text: {type:String, required:true, unique:false},
  created_by: {type:String, required:false, unique:false, default:''},
  assigned_to: {type:String, required:false, unique:false, default:''},
  open: {type:Boolean, default:true},
  status_text: {type:String, required:false, default:''},
  project:{type: mongoose.Schema.Types.ObjectId, ref: Project, required:true}

}, {
  timestamps: {createdAt: 'created_on', updatedAt: 'updated_on'},
  strictQuery: true});

issueSchema.plugin(uniqueValidator);
module.exports = mongoose.model('Issue', issueSchema);