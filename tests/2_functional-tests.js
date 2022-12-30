const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const ObjectId = require('mongoose').Types.ObjectId;
chai.use(chaiHttp);
const Issue = require('../models/issue');
const Project = require('../models/project');
const projectName = 'functionaltest'
const apiPath = '/api/issues/' + projectName
suite('Functional Tests', function() {

    suite('POST Tests', function(){
        test('Create an issue with every field', function(){
            chai
            .request(server)
            .post(apiPath)
            .send(
                {
                    issue_title: 'toUpdate',
                    issue_text: 'toUpdateText',
                    created_by: 'FunctionalTests',
                    assigned_to: 'funcTests',
                    status_text: 'Functional'
                }
            )
            .end(function(err, res){
                let issue = res.body
                assert.exists(issue._id);
                assert.exists(issue.created_on);
                assert.exists(issue.updated_on);
                assert.equal(issue._id, new ObjectId(issue._id));
                assert.equal(issue.issue_title, 'toUpdate');
                assert.equal(issue.issue_text, 'toUpdateText');
                assert.equal(issue.created_by, 'FunctionalTests');
                assert.equal(issue.assigned_to, 'funcTests');
                assert.equal(issue.status_text, 'Functional');
            });
        });

        test('Create an issue with only required field', function(){
            chai
            .request(server)
            .post(apiPath)
            .send(
                {
                    issue_title: 'toUpdate',
                    issue_text: 'toUpdateText',
                    created_by: 'FunctionalTests'
                }
            )
            .end(function(err, res){
                let issue = res.body
                assert.exists(issue._id);
                assert.exists(issue.created_on);
                assert.equal(issue._id, new ObjectId(issue._id));
                assert.equal(issue.issue_title, 'toUpdate');
                assert.equal(issue.issue_text, 'toUpdateText');
                assert.equal(issue.created_by, 'FunctionalTests');
                assert.equal(issue.assigned_to, '');
                assert.equal(issue.status_text, '');
            });
        });

        test('Create an issue with missing required field', function(){
            chai
            .request(server)
            .post(apiPath)
            .send(
                {
                    issue_title: 'missingReq',
                }
            )
            .end(function(err, res){
                assert.equal(res.body.error, 'required field(s) missing');
            });
        });

        
    });

    suite('GET Tests',  function(){
        
        test('View issues on a project',async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            chai
            .request(server)
            .get(apiPath)
            .end(function(err, res){
                let issues = res.body;
                assert.isArray(issues);
                for(let issue of issues){
                    assert.equal(issue.project, projectID);
                }
            });
        });

        test('View issues on a project with one filter', async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            chai
            .request(server)
            .get(apiPath)
            .query({issue_title:'toUpdate'})
            .end(function(err, res){
                let issues = res.body;
                assert.isArray(issues);
                for(let issue of issues){
                    assert.equal(issue.project, projectID);
                    assert.equal(issue.issue_title, 'toUpdate');
                }
            });
        });

        test('View issues on a project with multiple filters', async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            chai
            .request(server)
            .get(apiPath)
            .query({issue_title:'toUpdate', assigned_to:'funcTests'})
            .end(function(err, res){
                let issues = res.body;
                assert.isArray(issues);
                for(let issue of issues){
                    assert.equal(issue.project, projectID);
                    assert.equal(issue.issue_title, 'toUpdate');
                    assert.equal(issue.assigned_to, 'funcTests');
                }
            });
        });
    });

    suite('PUT tests', function(){
        
        test('Update one field on issue',async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            let issue = await Issue.findOne({issue_title:'toUpdate', project:projectID});
            let issueID = issue._id;
            chai
            .request(server)
            .put(apiPath)
            .send({_id:issueID,issue_title:'toDelete'})
            .end(function(err, res){
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, issueID);
            });
        });

        test('Update multiple field on issue',async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            let issue = await Issue.findOne({issue_title:'toUpdate', project:projectID});
            let issueID = issue._id;
            chai
            .request(server)
            .put(apiPath)
            .send({_id:issueID, issue_text:'toDeleteText', open:'false'})
            .end(function(err, res){
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, issueID);
            });
        });

        test('Update an issue with missing _id', function(){
            chai
            .request(server)
            .put(apiPath)
            .send({issue_text:'toDeleteText', open:'false'})
            .end(function(err, res){
                assert.equal(res.body.error, 'missing _id');
            });
        });

        test('Update an issue with no fields', async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            let issue = await Issue.findOne({issue_title:'toUpdate', project:projectID});
            let issueID = issue._id;
            chai
            .request(server)
            .put(apiPath)
            .send({_id:issueID})
            .end(function(err, res){
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, issueID);
            });
        });

        test('Update an issue with invalid ID', function(){
            chai
            .request(server)
            .put(apiPath)
            .send({_id:'invalidID', open:'false'})
            .end(function(err, res){
                assert.equal(res.body.error, 'could not update');
                assert.equal(res.body._id, 'invalidID');
            });
        });
    });

    suite('DELETE tests', function(){
        
        test('Delete an issue', async function(){
            let project = await Project.findOne({name:projectName})
            let projectID = project._id;
            let issue = await Issue.findOne({issue_title:'toDelete', project:projectID});
            let issueID = issue._id;
            chai
            .request(server)
            .delete(apiPath)
            .send({_id:issueID})
            .end(function(err, res){
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, issueID);
            });
        });

        test('Delete an issue with invalid ID', function(){
            chai
            .request(server)
            .delete(apiPath)
            .send({_id:'invalidID'})
            .end(function(err, res){
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, 'invalidID');
            });
        });

        test('Delete an issue with missing ID', function(){
            chai
            .request(server)
            .delete(apiPath)
            .send({})
            .end(function(err, res){
                assert.equal(res.body.error, 'missing _id');
            });
        });
    })
    

  
});
