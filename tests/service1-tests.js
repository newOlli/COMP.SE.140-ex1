const assert = require('assert');
const http = require('http'); 

describe('Service1 API', function () {
    it('should return service1 info', function (done) {
        http.get('http://localhost:8197/service1', (response) => {
            let data = '';
            

            response.on('data', (chunk) => {
                data += chunk;
            });


            response.on('end', () => {
                const parsedData = JSON.parse(data);
                assert.equal(response.statusCode, 200);
                assert.ok(parsedData.service1);
                assert.ok(parsedData.service2);
                done();
            });
        }).on('error', (err) => {
            done(err); 
        });
    });
});
