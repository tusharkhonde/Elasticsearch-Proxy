const esClient = require('./connect.js');

const indexName = "doctor";

/**
 * Creating index in Elasticsearch
 */ 
const createIndex = function() {
    return esClient.indices.create({
        index: indexName
    });
};

/**
 * Checking if index exists in Elasticsearch
 */
const indexExists = () => {
    return esClient.indices.exists({
        index: indexName
    });
};

indexExists().then((exists) => {
    if(!exists)
        return true;
}).then((status)=>{
    if(status)
        return createIndex();
});

/**
 * 
 * @param {*} name
 * @param {*} cb
 */
const searchIndex = (name,cb) => {

    const names = name.split(' ');
    let query = "";
    if(names.length == 1)
        query = names[0];
    else
        query = names[0] + " AND " + names[1];
    
    esClient.search({
                "index" : indexName,
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

/**
 * Indexing data from BetterDoctor API respsone
 * @param {*} index 
 * @param {*} type 
 * @param {*} data 
 */
const bulkIndex = (index, type, data) => {
  const bulkBody = [];

  data.forEach((item) => {
    bulkBody.push({
      index: {
        _index: index,
        _type: type,
        _id: item.id,
      },
    });

    bulkBody.push(item);
  });

  esClient.bulk({ body: bulkBody })
    .then((response) => {
      let errorCount = 0;
      response.items.forEach((item) => {
        if (item.index && item.index.error) {
          console.log(errorCount += 1, item.index.error);
        }
      });
      console.log(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
    })
    .catch(console.err);
};


module.exports = {
    createIndex,
    indexExists,
    searchIndex,
    bulkIndex
};