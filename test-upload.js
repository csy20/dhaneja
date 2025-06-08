const http = require('http');
const fs = require('fs');
const path = require('path');

async function testImageUpload() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbl90ZXN0XzEyMyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc0OTM4MjM4NiwiZXhwIjoxNzQ5OTg3MTg2fQ.9NvA9rm7CGPy5vY5QX3VBdG_Gzdn2aGS3zNYfZ8FxV4';
  
  // Read an existing image file to test upload
  const imagePath = '/workspaces/dhaneja/public/sample1.jpg';
  
  if (!fs.existsSync(imagePath)) {
    console.log('Sample image not found at:', imagePath);
    return;
  }
  
  const imageBuffer = fs.readFileSync(imagePath);
  const boundary = '----formdata-boundary-' + Date.now();
  
  // Create multipart form data
  const formData = Buffer.concat([
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from(`Content-Disposition: form-data; name="file"; filename="sample1.jpg"\r\n`),
    Buffer.from(`Content-Type: image/jpeg\r\n\r\n`),
    imageBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/upload',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': formData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('Upload status:', res.statusCode);
          if (responseData) {
            const parsed = JSON.parse(responseData);
            console.log('Upload response:', JSON.stringify(parsed, null, 2));
          }
          resolve(responseData);
        } catch (error) {
          console.log('Raw upload response:', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(formData);
    req.end();
  });
}

// Run the test
testImageUpload().catch(console.error);
