import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenresEntity } from './entities/genres.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GenresEntity])],
  exports: [TypeOrmModule],
})
export class GenresModule {}
