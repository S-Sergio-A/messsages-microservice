import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { ValidationModule } from "./pipes/validation.module";
import { MessageModule } from "./messages/messages.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`
    ),
    MessageModule,
    ValidationModule
  ]
})
export class AppModule {}
