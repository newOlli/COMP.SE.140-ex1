const http = require('http');
const fetch = require('node-fetch');
const auth = require('basic-auth');

let currentState = 'INIT';
const validStates = ['INIT', 'PAUSED', 'RUNNING', 'SHUTDOWN'];
const stateHistory = []; 

const checkValidState = (req,res) => {
  if(currentState === "INIT" || currentState === "PAUSED"){
   res.writeHead(503, { 'Content-Type': 'text/plain' });
   res.end(`State of the API Gateway is ${currentState}. Please log in and change it to running in order to access it.`);
   return false;
 }
 return true;
}

const authenticate = (req) => {
  const credentials = auth(req);
  if (!credentials || credentials.name !== 'admin' || credentials.pass !== 'admin') {
    return false;
  }
  return true;
};

const handleStateChange = (req, res) => {
  

  if (req.method === 'GET') {
    if(!checkValidState(req,res)){
      return;
    }
    return res.end(currentState); 
  }

  if (req.method === 'PUT') {
    let body = '';
    
    req.on('data', chunk => {
        body += chunk;
    });

    req.on('end', () => {
        try {
            const requestBody = body.replace(/"/g, '')
            //JOS EI OO RUNNING NIIN EI VOIDA AJAA SHUTDOWN SERVICEÄKÄÄN
            if(requestBody==="SHUTDOWN" && !checkValidState(req,res)){
              return;
            }
            const newState = requestBody;
            //TSEKKI ETTÄ PAYLOAD ON VALID
            if (!validStates.includes(newState)) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Invalid state '+newState);
                return;
            }
            //TSEKKI JOS KOITETAAN ANTAA SAMAA STATEA UUDELLEEN
            if (currentState === newState) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`State is already ${currentState}`);
            } else {

                const timestamp = new Date().toISOString();
                stateHistory.push(`${timestamp}: ${currentState}->${newState}`);

                currentState = newState;
                
                //SHUTDOWN HANDLAUS
                if (currentState === "SHUTDOWN") {
                  const service1Url = 'http://shutdown-service:6969/';
                
                  fetch(service1Url, { method: "POST" })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                      }
                      return response.json(); 
                    })
                    .then(data => {
                      res.writeHead(200, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(data));
                    })
                    .catch(err => {
                      console.error('Error shutting down containers:', err.message);
                      res.writeHead(500, { 'Content-Type': 'text/plain' });
                      res.end('Internal Server Error');
                    });
                }

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`State changed to ${currentState}`);
            }
        } catch (error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON format '+ body + "Error:" + error);
        }
    });
  } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
  }
};



const server = http.createServer((req, res) => {
  //AUTHENTICATION HANDLAUS INIT TILASSA
  if(currentState ==="INIT"){
    if (!authenticate(req)) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      return res.end('Unauthorized');
    }
  }

  if (req.url === '/state') {
    handleStateChange(req, res);
  } else if (req.url === '/run-log') {
    //TODO
  } else if (req.url.startsWith('/request')) {
    //TODO
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 8197;
server.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
