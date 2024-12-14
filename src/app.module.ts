import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { MessageModule } from "~/modules/messages/messages.module";
import { RabbitModule } from "~/modules/rabbit";
import { defaultImports, LoggerModule } from "~/modules/common";
import { HealthCheckModule } from "~/modules/health-check";

@Module({
  imports: [
    ...defaultImports,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 120,
          limit: 1000,
          ignoreUserAgents: [new RegExp("googlebot", "gi"), new RegExp("bingbot", "gi")]
        }
      ]
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${process.env.MONGO_USER_DATABASE_NAME}?retryWrites=true&w=majority`,
      {
        connectionName: "user"
      }
    ),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${process.env.MONGO_MESSAGES_DATABASE_NAME}?retryWrites=true&w=majority`,
      {
        connectionName: "message"
      }
    ),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${process.env.MONGO_ROOMS_DATABASE_NAME}?retryWrites=true&w=majority`,
      {
        connectionName: "room"
      }
    ),
    LoggerModule,
    MessageModule,
    RabbitModule,
    HealthCheckModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
