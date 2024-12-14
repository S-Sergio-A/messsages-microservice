import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitProducerService } from "./rabbit-producer.service";

@Module({
  imports: [ConfigModule],
  providers: [RabbitProducerService],
  exports: [RabbitProducerService]
})
export class RabbitModule {}
