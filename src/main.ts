import { IoAdapter } from "@nestjs/platform-socket.io";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import "reflect-metadata";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: [process.env.FRONT_URL],
    credentials: true,
    exposedHeaders: ["Access-Token", "Refresh-Token", "Client-Token", "Country", "Content-Type", "Fingerprint"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"]
  });

  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.PORT || 7000);
}

bootstrap();
