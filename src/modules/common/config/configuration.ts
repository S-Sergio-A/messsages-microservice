import * as process from "process";
import * as dotenv from "dotenv";
import {
  AppConfigInterface,
  CloudinaryConfigInterface,
  MongoConfigInterface,
  RabbitConfigInterface
} from "@ssmovzh/chatterly-common-utils";

dotenv.config();

export default () => ({
  app: {
    port: +process.env.PORT,
    environment: process.env.ENVIRONMENT,
    clientUrl: process.env.CLIENT_URL
  } as AppConfigInterface,
  mongoConfig: {
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    clusterUrl: process.env.MONGO_CLUSTER_URL
  } as MongoConfigInterface,
  rabbitConfig: {
    protocol: "amqp",
    hostname: process.env.RABBIT_HOST,
    port: process.env.RABBIT_PORT ? +process.env.RABBIT_PORT : 5672,
    username: process.env.RABBIT_USERNAME,
    password: process.env.RABBIT_PASSWORD
  } as RabbitConfigInterface,
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  } as CloudinaryConfigInterface
});
