var express = require('express');
var router = express.Router();
var records = require('../helper/betterdoctor.js');
var elastic = require('../helper/elasticsearch.js');
var async = require('async');

router.get('/', function(req,res){
    res.json('BetterDoctor Proxy App');
});

router.get('/api/v1/doctors/search', function(req, res) {

  const name = req.query.name;

 if(!name)
    res.json("Request parametrer \'name\' needs to be provided");
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
                    if(result.data.length > 1) {

                        async.series([
                            function (cb) {
                                if (!elastic.indexExists()) {
                                    elastic.createIndex();
                                }
                                cb();
                            },
                            /**
                             * Add Doctor response to elasticsearch
                             */
                            function (cb) {
                                result.data.map(function (data) {
                                    elastic.addRecords(data);
                                });
                                cb(null,result.data);
                            }
                        ], function (err, results) {
                            cb(null,results[1]);
                        });

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
                res.json(data); // response from elasticsearch
            }
            else
                res.json(results[1]); // response from BetterDoctor API
        });
    }

});


module.exports = router;
