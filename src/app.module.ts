import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { MessageModule } from "~/modules/messages/messages.module";
import { RabbitModule } from "~/modules/rabbit";
import { defaultImports } from "~/modules/common";
import { ConnectionNamesEnum, HealthCheckModule, LoggerModule } from "@ssmovzh/chatterly-common-utils";

@Module({
  imports: [
    ...defaultImports,
    MessageModule,
    RabbitModule,
    HealthCheckModule,
    LoggerModule,
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
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${ConnectionNamesEnum.USERS}?retryWrites=true&w=majority&appName=Cluster0`,
      {
        connectionName: ConnectionNamesEnum.USERS
      }
    ),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${ConnectionNamesEnum.ROOMS}?retryWrites=true&w=majority&appName=Cluster0`,
      {
        connectionName: ConnectionNamesEnum.ROOMS
      }
    ),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${ConnectionNamesEnum.MESSAGES}?retryWrites=true&w=majority&appName=Cluster0`,
      {
        connectionName: ConnectionNamesEnum.MESSAGES
      }
    )
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
