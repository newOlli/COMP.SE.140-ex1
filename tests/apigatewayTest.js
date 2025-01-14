const assert = require('assert');
const http = require('http');


function httpRequest({ method, path, payload = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: 'localhost',
      port: 8198,
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
  const headers = "";
  if(auth){
    headers = {
      'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64'), 
      'Content-Type': 'application/json', 
    };
  } else {
    headers = { 'Content-Type': 'application/json' }
  }
   
  httpRequest({
    method: 'PUT',
    path: '/state',
    payload, 
    headers, 
  })
}


describe('GET /state', function () {
  it('should return the current state', async function () {
    changeState("RUNNING",true);

    const response = await httpRequest({ method: 'GET', path: '/state' });
    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    assert.ok(['INIT', 'PAUSED', 'RUNNING', 'SHUTDOWN'].includes(response.body), 'Expected a valid state');
  });
});

describe('PAUSED State Behavior', function () {
  it('should not process requests when in PAUSED state', async function () {
    changeState("RUNNING",true);
    changeState("PAUSED",false);
    const response = await httpRequest({ method: 'GET', path: '/request' });
    assert.strictEqual(response.statusCode, 503, 'Expected status code to be 503 (Service Unavailable)');
  });
});


describe('RUNNING State Behavior', function () {
  it('should process requests normally when in RUNNING state', async function () {
    changeState("RUNNING",true);
    const response = await httpRequest({ method: 'GET', path: '/request' });
    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    assert.strictEqual(response.body, 'Request processed', 'Expected correct response from /request');
  });
});

describe('GET /run-log', function () {
  it('should return state transition log', async function () {
    changeState("RUNNING",true);

    const response = await httpRequest({ method: 'GET', path: '/run-log' });
    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
    assert.include(response.body, 'INIT->RUNNING', 'Expected run-log to contain state transition');
  });
});

describe('SHUTDOWN State Behavior', function () {
  it('should stop all containers when in SHUTDOWN state', async function () {
    changeState("RUNNING",true);
    const response = await httpRequest({
      method: 'PUT',
      path: '/state',
      payload: { state: 'SHUTDOWN' },
      headers: { 'Content-Type': 'application/json' },
    });

    assert.strictEqual(response.statusCode, 200, 'Expected status code to be 200');
  });
});