const http = require('http');
const os = require('os');
const execSync = require('child_process').execSync;

const app = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        try {
            const service1Info = await getMainServiceInfo();
            const service2Info = await getService2Info();

            const responseData = {
                service1: service1Info,
                service2: service2Info
            };
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(responseData));
        } catch (error) {
            console.error('Error handling request:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

async function getMainServiceInfo() {
    const ipAddress = os.networkInterfaces().eth0[0].address;
    const processes = execSync('ps -ax').toString();
    const diskSpace = execSync('df -h /').toString();
    const upTime = execSync('uptime -p').toString();

    return {
        ipAddress: ipAddress,
        processes: processes,
        diskSpace: diskSpace,
        upTime: upTime
    };
}

async function getService2Info() {
    const SERVICE2_URL = 'http://service2:8080';

    try {
        const response = await fetch(SERVICE2_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const service2Info = await response.json();
        return service2Info;
    } catch (error) {
        console.error('Error fetching Service2 data:', error);
        return null;
    }
}

app.listen(8199, () => {
    console.log('Service1 is listening on port 8199');
});
