const records = require('../betterdoctor/app.js'),
      elastic = require('../elasticsearch/app.js')
      async = require('async');

let index = (req, res) => res.send("Better Doctor App");

let search = (req, res) => {

    const name = req.query.name;

    if(!name)
        res.send("Request parametrer \'name\' needs to be provided");

    else{
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
                    res.json(data); // Response from elasticsearch
                }
                else
                    res.json(results[1]); // Response from BetterDoctor API
            });
    }
}

module.exports = {
    index,
    search
};