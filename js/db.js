var dynamodb = null;
var docClient = null;

function init(){
  if(!dynamodb){
    AWS.config.region = 'ca-central-1';
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: DYNAMO_DB_ID,
    });

    dynamodb = new AWS.DynamoDB();
    docClient = new AWS.DynamoDB.DocumentClient();
  }
}

// Notes
async function getNotes(advisorId){
  init();
  let params = {
    TableName: 'Notes',
    Key :{
      AdvisorId: advisorId
    }
  }
  return new Promise ((resolve, reject) => {
    docClient.get(params, function(err, data){
      if(!err)
        resolve(data.Item);
      else
        reject(err);
    })
  })
}

async function updateNotes(advisorId, message){
  init();
  let params = {
    TableName: 'Notes',
    Key :{
      AdvisorId: advisorId
    },
    UpdateExpression: "set message = :m",
        ExpressionAttributeValues:{
            ":m": message
        },
        ReturnValues:"UPDATED_NEW"
    };

  return new Promise ((resolve, reject) => {
    docClient.update(params, function(err, data){
      if(!err)
        resolve(data.Item);
      else
        reject(err);
    })
  })
}

// Status
async function getStatuses(advisorId){
  init();
  let params = {
    TableName: 'Statuses',
    KeyConditionExpression: "#id = :aid",
        ExpressionAttributeNames:{
            "#id": "advisorId"
        },
        ExpressionAttributeValues: {
            ":aid":advisorId
        }
  }
  return new Promise ((resolve, reject) => {
    docClient.query(params, function(err, data){
      if(!err)
        resolve(data.Items);
      else
        reject(err);
    })
  })
}

async function addStatus(advisorId, officer, message){
  init();
  let timestamp = new Date().getTime();
  let params = {
    TableName: 'Statuses',
    Item : {
      advisorId,
      timestamp,
      officer,
      message
    }
  }

  return new Promise ((resolve, reject) => {
    docClient.put(params, function(err, data){
      if(!err)
        resolve();
      else
        reject(err);
    })
  })
}

async function delStatus(advisorId, timestamp){
  init();
  let params = {
    TableName: 'Statuses',
    Key : {
      advisorId,
      timestamp
    }
  }

  return new Promise ((resolve, reject) => {
    docClient.delete(params, function(err, data){
      if(!err)
        resolve();
      else
        reject(err);
    })
  })
}

// Rejections
async function getRejections(advisorId){
  init();
  let params = {
    TableName: 'Rejections',
    KeyConditionExpression: "#id = :aid",
        ExpressionAttributeNames:{
            "#id": "advisorId"
        },
        ExpressionAttributeValues: {
            ":aid":advisorId
        }
  }
  return new Promise ((resolve, reject) => {
    docClient.query(params, function(err, data){
      if(!err)
        resolve(data.Items);
      else
        reject(err, advisorId);
    })
  })
}

async function updateRejection(advisorId, rejectionId, completedArray){
    init();
    let params = {
      TableName: 'Rejections',
      Key :{
        advisorId,
        rejectionId
      },
      UpdateExpression: 'set rejection = :completedArray',
      ExpressionAttributeValues: {
        ":completedArray": completedArray
      },
      ReturnValues:"UPDATED_NEW"
    };

    return new Promise ((resolve, reject) => {
      docClient.update(params, function(err, data){
        if(!err)
          resolve(data.Item);
        else
          reject(err);
      })
    })
}
