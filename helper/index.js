const records = require('../helper/betterdoctor.js'),
      elastic = require('../helper/elasticsearch.js')
      async = require('async');


let process = (name) => {
    async.series([
            function (cb) {
                elastic.searchIndex(name,function (data) {
                    /** 
                     * If data not available in elasticsearch, then search BetterDoctore API 
                     */
                    if(data.hits.total === 0)
                        cb();
                    /** 
                     * If data available in elasticsearch, then return response
                     */
                    else
                        return cb(true,data.hits.hits);
                });
            },
            function (cb) {

                /**  
                 * Get records from BetterDoctor API
                */
                records(name,function (result) {
                    if(result.data.length >= 1) {
                        /**
                        * Add Doctor response to elasticsearch
                        */
                        elastic.bulkIndex("doctor", "document", result.data);
                        cb(null,result.data);
                    }else{
                        cb(null,"No results found for given name");
                    }
                });
            }
        ],function (err, results) {
            if(err && results[0]) {
                const data = results[0].map(function (item) {
                                return item._source;
                            });
                return data; // Response from elasticsearch
            }
            else
                return results[1]; // Response from BetterDoctor API
        });
}

module.exports = process;