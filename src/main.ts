import { WsAdapter } from "@nestjs/platform-ws";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import "reflect-metadata";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: [process.env.FRONT_URL, "*"],
    credentials: true,
    exposedHeaders: ["Access-Token", "Refresh-Token", "Client-Token", "Country", "Content-Type"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"]
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(process.env.PORT || 7000);
}

bootstrap();
