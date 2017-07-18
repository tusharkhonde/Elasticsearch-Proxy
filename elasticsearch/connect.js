const elastic = require('elasticsearch'),
      config = require('config');

const esClient = new elastic.Client({
    host: config.get('Elasticsearch.URL')
});

esClient.ping({
  requestTimeout: "1000"
}, function (error) {
  if (error) {
    console.log('Elasticsearch cluster is down!');
    process.exit(0);
  } else {
    console.log('Elasticsearch Connected');
  }
});

module.exports = esClient;
