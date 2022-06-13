const uuid = require("uuid");
const fs = require("fs");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync("./upload.proto", {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const uploadProto = grpc.loadPackageDefinition(packageDefinition).UploadPackage;

const uploadFile = (req, callback) => {
    let chunk, fileName;
    req.on('data', async (payload) => {
        fileName = payload.name
        chunk = payload.chunk
        fs.appendFileSync(`./backup/${fileName}`, chunk);
    });

    req.on('end', async () => {
        callback(null, {fileName});
    });
};


const server = new grpc.Server();        
server.addService(uploadProto.UploadService.service, {
    uploadFile: uploadFile
});


const address = `0.0.0.0:8000`;
server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, _) => {
    if(!error) {
        server.start();
        console.log(`Servico iniciado em: ${address}`); 
    }
    else {
        console.error(error);
    }
});