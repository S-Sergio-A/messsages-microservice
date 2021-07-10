import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { WsAdapter } from "@nestjs/platform-ws";
import helmet from "helmet";

async function bootstrap() {
  // const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  //   transport: Transport.TCP,
  //   options: {
  //     host: "0.0.0.0",
  //     port: 9000
  //   }
  // });

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: [process.env.FRONT_URL],
    credentials: true,
    exposedHeaders: ["Access-Token", "Refresh-Token", "Client-Token", "Country", "Content-Type"],
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"]
  });

  // const config = new DocumentBuilder()
  //   .setTitle("Authentication and entrance microservice")
  //   .setDescription("The cats API description")
  //   .setVersion("1.0")
  //   .addTag("authentication, authorization, entrance")
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup("api", app, document);

  app.useWebSocketAdapter(new WsAdapter(app));
  // app.listen(() => console.log("Microservice is listening"));
  await app.listen(7000);
}

bootstrap();
