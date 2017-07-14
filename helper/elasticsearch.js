var elastic = require('elasticsearch');

const esClient = new elastic.Client({
    host: "localhost:9200",
    requestTimeout: "60000"
});

esClient.ping({
  requestTimeout: "60000"
}, function (error) {
  if (error) {
    console.trace('Elasticsearch cluster is down!');
  } else {
    console.log('Elasticsearch Connected');
  }
});

/**
 * Adding records to Elasticsearch
 */ 
const addRecords = function (record) {

    esClient.index({
        index:"doctor",
        type:"record",
        body: record
    });
};

/**
 * Creating index in Elasticsearch
 */ 
const createIndex = function() {
    return esClient.indices.create({
        index: "doctor"
    });
};

/**
 * Checking if index exists in Elasticsearch
 */
const indexExists = function() {
    return esClient.indices.exists({
        index: "doctor"
    });
};

/**
 * 
 * @param {*} name to search 
 * @param {*} cb callback
 */
const searchIndex = function (name,cb) {

    let names = name.split(' ');
    let query = "";
    if(names.length == 1)
        query = names[0];
    else
        query = names[0] + " AND " + names[1];
    
    esClient.search({
                "index" : "doctor",
                "body": {
                    "query": {
                        "query_string": {
                            "fields": ["profile.first_name", "profile.last_name"],
                            "query": query  
                        }
                    }
                }
    }).then(function (responses) {
            cb(responses);
    });
};

module.exports = {
    addRecords: addRecords,
    createIndex: createIndex,
    indexExists: indexExists,
    searchIndex: searchIndex
};