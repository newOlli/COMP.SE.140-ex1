const assert = require('assert');
const http = require('http');


function httpRequest({ method, path, payload = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: 'apigateway',
      port: 8197,
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

function changeState(newState,auth){
  const payload = newState; 
  let headers = "";
  if(auth){
    headers = {
      'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64'), 
      'Content-Type': 'application/json', 
    };
  } else {
    headers = { 'Content-Type': 'application/json' }
  }
   
  return httpRequest({
    method: 'PUT',
    path: '/state',
    payload, 
    headers, 
  })
}


describe('GET /state', function () {
  this.timeout(5000);
  it('should return the current state', async function () {
    await changeState("RUNNING",true);

    const response = await httpRequest({ method: 'GET', path: '/state' });
    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    assert.ok(['INIT', 'PAUSED', 'RUNNING', 'SHUTDOWN'].includes(response.body), 'Expected a valid state');
  });
});

describe('PAUSED State Behavior with GET /state', function () {
  this.timeout(5000);
  it('should not process requests when in PAUSED state (GET /state)', async function () {

    await changeState("RUNNING",true);

    await changeState("PAUSED",false);

    const response = await httpRequest({ method: 'GET', path: '/state' });

    assert.strictEqual(response.statusCode, 503, 'Expected status code to be 503');
  });
});

describe('INIT State Behavior with GET /state', function () {
  this.timeout(5000);
  it('should not process requests when in PAUSED state (GET /state)', async function () {
    await changeState("INIT",true);
    const response = await httpRequest({ method: 'GET', path: '/state' });

    assert.strictEqual(response.statusCode, 503, 'Expected status code to be 503');
  });
});

describe('PAUSED State Behavior with GET /request', function () {
  this.timeout(5000);
  it('should not process requests when in PAUSED state (GET /request)', async function () {

    await changeState("RUNNING",true);

    await changeState("PAUSED",false);

    const response = await httpRequest({ method: 'GET', path: '/request' });

    assert.strictEqual(response.statusCode, 503, 'Expected status code to be 503');
  });
});


describe('RUNNING State Behavior with /request', function () {
  this.timeout(5000);
  it('should process requests normally when in RUNNING state', async function () {
    await changeState("RUNNING",true);
    const response = await httpRequest({ method: 'GET', path: '/request' });
    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    assert.strictEqual(response.body, 'Request processed', 'Expected correct response from /request');
  });
});

describe('GET /run-log', function () {
  this.timeout(5000);
  it('should return state transition log', async function () {
    await changeState("RUNNING",true);

    const response = await httpRequest({ method: 'GET', path: '/run-log' });
    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    assert.include(response.body, 'INIT->RUNNING', 'Expected run-log to contain state transition');
  });
});

describe('SHUTDOWN State Behavior when state RUNNING', function () {
  this.timeout(5000);
  it('should stop all containers when in SHUTDOWN state', async function () {
    await changeState("RUNNING",true);
    const response = await httpRequest({
      method: 'PUT',
      path: '/state',
      payload: { state: 'SHUTDOWN' },
      headers: { 'Content-Type': 'application/json' },
    });

    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
  });
});