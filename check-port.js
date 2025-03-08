/**
 * Server Port Check Utility
 * This script checks which port the server is running on and reports it
 */
const http = require('http');
const net = require('net');

console.log('=== Server Port Check ===');

// Check a range of ports
const startPort = 3000;
const endPort = 3010;

console.log(`Checking ports ${startPort} through ${endPort}...`);

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is not in use
    });
    
    server.listen(port);
  });
}

// Function to check if a service responds on a port
function checkServiceResponse(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          isService: true,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          dataLength: data.length
        });
      });
    });
    
    req.on('error', () => {
      resolve({ isService: false });
    });
    
    req.setTimeout(500, () => {
      req.destroy();
      resolve({ isService: false });
    });
  });
}

// Main function to check all ports
async function checkPorts() {
  let foundServer = false;
  
  for (let port = startPort; port <= endPort; port++) {
    const portInUse = await isPortInUse(port);
    
    if (portInUse) {
      console.log(`Port ${port} is in use. Checking if it's our server...`);
      const serviceCheck = await checkServiceResponse(port);
      
      if (serviceCheck.isService) {
        console.log(`✅ Found HTTP service on port ${port} (Status: ${serviceCheck.statusCode})`);
        console.log(`   Content-Type: ${serviceCheck.contentType || 'unknown'}`);
        console.log(`   Response size: ${serviceCheck.dataLength} bytes`);
        
        // Verify it's our application by checking the export endpoint
        try {
          const testData = {
            format: 'html',
            reportData: {
              summary: 'Test',
              maskedReport: 'Test'
            },
            templateName: 'default'
          };
          
          const exportCheckReq = http.request({
            hostname: 'localhost',
            port: port,
            path: '/api/export-report',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }, (res) => {
            console.log(`   Export API endpoint check returned status: ${res.statusCode}`);
            if (res.statusCode === 200) {
              console.log(`   ✅ This appears to be our server!`);
              console.log(`\n🔵 IMPORTANT: Make sure your client is using port ${port}`);
              foundServer = true;
            }
          });
          
          exportCheckReq.on('error', () => {});
          exportCheckReq.write(JSON.stringify(testData));
          exportCheckReq.end();
        } catch (error) {
          console.log(`   Error testing endpoint: ${error.message}`);
        }
      } else {
        console.log(`Port ${port} is in use but not by an HTTP service`);
      }
    }
  }
  
  if (!foundServer) {
    console.log('\n❌ No running server found on ports 3000-3010');
    console.log('Please start the server with: npm start');
  }
  
  console.log('\n=== Port Check Complete ===');
}

checkPorts();
