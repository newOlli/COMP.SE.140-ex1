const assert = require('assert');
const http = require('http');
const auth = 'Basic ' + Buffer.from('admin:admin').toString('base64'); // Basic auth for username:admin and password:admin

describe('NGINX API Gateway with Basic Authentication', function () {
  it('should proxy to Service1 and return service1 info after authenticating', function (done) {
    const options = {
      hostname: 'localhost',
      port: 8198,
      path: '/service1/',
      method: 'GET',
      headers: {
        'Authorization': auth, // Add Authorization header with Basic Auth
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          assert.strictEqual(res.statusCode, 200, 'Expected response status to be 200');
          assert.ok(parsedData.service1, 'Expected service1 key in response');
          assert.ok(parsedData.service2, 'Expected service2 key in response');
          done();
        } catch (e) {
          done(e); // Pass the error if JSON parsing fails
        }
      });
    });

    req.on('error', (error) => {
      done(error);
    });

    req.end();
  });
});
