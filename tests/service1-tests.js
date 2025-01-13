const assert = require('assert');
const fetch = require('node-fetch');

describe('Service1 API', function () {
    it('should return service1 info', async function () {
        const response = await fetch('http://localhost:8197/service1');
        const data = await response.json();
        assert.equal(response.status, 200);
        assert.ok(data.service1);
        assert.ok(data.service2);
    });
});
