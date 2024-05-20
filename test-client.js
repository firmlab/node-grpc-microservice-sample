const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const ORDER_PROTO_PATH = path.join(__dirname, 'protos/order.proto');
const orderProtoDefinition = protoLoader.loadSync(ORDER_PROTO_PATH);
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;

const orderClient = new orderProto.OrderService('localhost:50052', grpc.credentials.createInsecure());

orderClient.CreateOrder({ userId: '1' }, (error, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Order created:', response);
  }
});
