const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./upload.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const endpoint = 'localhost:8000';
const uploadProto = grpc.loadPackageDefinition(packageDefinition).UploadPackage;
const service = new uploadProto.UploadService(endpoint, grpc.credentials.createInsecure());

const serviceUp = service.uploadFile((error, response) => {
    if(!error) {
        console.log(response);
    } else {
        console.error(error)  
    }
});


let fileName = 'index.html'
const readStream = fs.createReadStream(fileName);
readStream.on('data', (chunk) => {
    serviceUp.write({
        name: fileName,
        chunk: Uint8Array.from(chunk)
    });
});

readStream.on('end', () => {
    serviceUp.end();
});