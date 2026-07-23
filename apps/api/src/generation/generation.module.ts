import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsEntity } from '../posts/entities/posts.entity';
import { GenerationController } from './generation.controller';
import { GenerationService } from './generation.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostsEntity])],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
