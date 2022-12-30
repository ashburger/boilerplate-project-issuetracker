'use strict';
const Issue = require('../models/issue');
const Project = require('../models/project');
var sanitize = require('mongo-sanitize');
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      try{
        let project = sanitize(req.params.project);
        let currentProject = await Project.findOne({name:project});
        let filter = {};
        let options = req.query;
        for(let option in options){
          filter[sanitize(option)] = sanitize(options[option]);
        }
        filter['project'] = currentProject._id;
        let projectIssues = await Issue.find(filter);
        res.status(200).send(projectIssues);
      }
      catch(err){
        res.status(404).send({error: "Project not found"});
      }
      
      
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      
      try{
        let issue = req.body;
        let currentProject = await Project.findOneAndUpdate({name:project},{name:project},{new:true, upsert: true});
        let newIssue = new Issue({
              issue_title: issue.issue_title,
              issue_text: issue.issue_text,
              created_by: issue.created_by,
              assigned_to: issue.assigned_to,
              status_text: issue.status_text,
              project: currentProject._id
            });
            newIssue = await newIssue.save()
            res.status(200).send(newIssue);
         
    }catch(err){
      res.status(200).send({error: 'required field(s) missing' });
    }
    })
    
    .put(async function (req, res){
      try{
      let params = req.body;
      let toUpdateId = sanitize(params._id)
      if(!toUpdateId){
        res.status(200).send({error: 'missing _id'});
        return;
      }
      
      let updates = {
        issue_title: sanitize(params.issue_title),
        issue_text:sanitize(params.issue_text),
        created_by:sanitize(params.created_by),
        assigned_to:sanitize(params.assigned_to),
        status_text:sanitize(params.status_text)};
        let cleanUpdates = Object.entries(updates).reduce((updates, [key, value]) => {
          if (value && value.toString().trim()) updates[key] = value
          return updates
          }, {})
        if(params.open == 'false'){
          cleanUpdates['open'] = false;
        }
      if(Object.keys(cleanUpdates).length == 0){
        res.status(200).send({error: 'no update field(s) sent', '_id': toUpdateId});
        return;
      }
      let updatedIssue = await Issue.findOneAndUpdate({_id: toUpdateId}, cleanUpdates, {new:true, upsert:false});
      if(updatedIssue){
        res.status(200).send({result: 'successfully updated', '_id':updatedIssue._id});
      }else{
        res.status(200).send({error: 'could not update', '_id':toUpdateId})
      }
      }catch(err){
        res.status(200).send({error: 'could not update', '_id':req.body._id})
      }
      
    })
    
    .delete(async function (req, res){
      try{
        let toDeleteId = sanitize(req.body._id);
        if(!toDeleteId){
          res.status(200).send({error: 'missing _id'});
          return;
        }
        let deletedIssue = await Issue.deleteOne({_id:toDeleteId});
        if(deletedIssue.deletedCount == 1){
          res.status(200).send({result: 'successfully deleted', '_id':toDeleteId});
        }else{
          res.status(200).send({error: 'could not delete', '_id':toDeleteId});
        }
      }catch(err){
        res.status(200).send({error: 'could not delete', '_id':req.body._id});
      }
      
    });
    
};
