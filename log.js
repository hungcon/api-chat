var axios = require('axios');

var log = function (req, res, next) {
    var temp_log = {};
    const start = Date.now();
    res.on('finish', function(){
      temp_log = {
        timestamp: start,
        took: (Date.now() - start)/1000 + 's',
        userAgent: req.headers['user-agent'],
        host: req.headers.host,
        path: req.url,
        method: req.method,
        status: res.statusCode,
        httpVersion: req.httpVersion,
      }
      axios.post('http://192.168.1.10:3000/store_log', temp_log)
      .then(res => {
          if(res.status == 200){
              console.log(OK);
          }
      })
      .catch(err =>{
        next(err);
      })
    });
    next();
}

module.exports = log;