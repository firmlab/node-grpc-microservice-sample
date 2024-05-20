const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../protos/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

const users = {
  '1': { userId: '1', name: 'John Doe', email: 'john@example.com' },
  '2': { userId: '2', name: 'Jane Doe', email: 'jane@example.com' },
};

function getUser(call, callback) {
  const user = users[call.request.userId];
  if (user) {
    callback(null, user);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'User not found',
    });
  }
}

function main() {
  const server = new grpc.Server();
  server.addService(userProto.UserService.service, { GetUser: getUser });
  const PORT = process.env.PORT || 50051;
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`User service running at http://127.0.0.1:${PORT}`);
    server.start();
  });
}

main();
