import { IoAdapter } from "@nestjs/platform-socket.io";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import "reflect-metadata";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from "@ssmovzh/chatterly-common-utils";

(async () => {
  const app = await NestFactory.create(AppModule);
  const logger = await app.resolve(LoggerService); // Use resolve() for transient scoped providers
  const configService = app.get(ConfigService);

  app.useLogger(logger);
  app.use(helmet());

  const clientUrl = configService.get<string>("app.clientUrl");
  app.enableCors({
    origin: [clientUrl],
    credentials: true,
    exposedHeaders: ["X-Access-Token", "X-Refresh-Token", "X-Client-Token", "X-Country", "Content-Type"],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"]
  });

  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });

  const port = configService.get<number>("app.port");
  await app.listen(port);

  app.useWebSocketAdapter(new IoAdapter(app));
})();
