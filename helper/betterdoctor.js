var request = require('request');
var key = require('./secrets.js');

const getRecords =  (name,cb) => {

    request.get('https://api.betterdoctor.com/2016-03-01/doctors?name='+name+'&user_key='+key,function (error,response) {
        cb(JSON.parse(response.body));
    });
};

module.exports  = getRecords;