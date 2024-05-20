const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const USER_PROTO_PATH = path.join(__dirname, '../protos/user.proto');
const userProtoDefinition = protoLoader.loadSync(USER_PROTO_PATH);
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;

const userClient = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());

function getUserDetails(userId) {
  return new Promise((resolve, reject) => {
    userClient.GetUser({ userId }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function createOrder(call, callback) {
  try {
    const user = await getUserDetails(call.request.userId);
    callback(null, { orderId: '12345', userId: user.userId, userName: user.name, userEmail: user.email });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to fetch user details',
    });
  }
}

function main() {
  const server = new grpc.Server();
  const orderProtoPath = path.join(__dirname, '../protos/order.proto');
  const orderProtoDefinition = protoLoader.loadSync(orderProtoPath);
  const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;

  server.addService(orderProto.OrderService.service, { CreateOrder: createOrder });
  const PORT = process.env.PORT || 50052;
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Order service running at http://127.0.0.1:${PORT}`);
    server.start();
  });
}

main();
