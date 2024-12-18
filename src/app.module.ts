import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";
import { MessageModule } from "~/modules/messages/messages.module";
import { RabbitModule } from "~/modules/rabbit";
import { defaultImports } from "~/modules/common";
import { ConnectionNamesEnum, HealthCheckModule, LoggerModule, MongoConfigInterface } from "@ssmovzh/chatterly-common-utils";
import { ConfigModule, ConfigService } from "@nestjs/config";

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoConfig = configService.get<MongoConfigInterface>("mongoConfig");
        return {
          uri: `mongodb+srv://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.clusterUrl}/${ConnectionNamesEnum.CHATTERLY}?retryWrites=true&w=majority&appName=Cluster0`
        };
      },
      inject: [ConfigService]
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ]
})
export class AppModule {}
