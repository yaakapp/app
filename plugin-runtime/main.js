const { hookImport } = require('./src/run-plugin');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('proto/echo.proto', {});
const gRPCObject = grpc.loadPackageDefinition(packageDef);

const echoPackage = gRPCObject.echo;

const server = new grpc.Server();
server.addService(echoPackage.Echo.service, {
  echo: (call, callback) => {
    callback(null, { message: `Hello ${call.request.name}` });
  },
  hookImport: (call, callback) => {
    hookImport(call.request.data).then((res) => {
      console.log('DATA', res);
      callback(null, { data: JSON.stringify(res) });
    });
  },
});

server.bindAsync('0.0.0.0:4000', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err != null) {
    console.log('ERROR', err);
    process.exit(1);
  }

  console.log('Started gRPC server on :' + port);
});
