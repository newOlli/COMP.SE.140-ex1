const assert = require('assert');
const http = require('http');


function httpRequest(hostname,port,{ method, path, payload = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: hostname,
      port: port,
      path,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);

    if (payload) req.write(JSON.stringify(payload));
    req.end();
  });
}


describe('GET service1', function () {
    this.timeout(5000);
    it('should return the service information from service1 and 2', async function () {
      const response = await httpRequest("service1",8199,{ method: 'GET', path: '/' });
      assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    });
  });

  describe('GET nginx', function () {
    this.timeout(5000);
    it('should return the main html nginx', async function () {
      const response = await httpRequest("nginx",8198,{ method: 'GET', path: '/' });
      assert.strictEqual(response.statusCode, 401, 'Expected status code to be 401 as no authorization headers are sent');
      assert.ok(response.body.includes("<html>"), 'Expected a html return');
    });
  });
