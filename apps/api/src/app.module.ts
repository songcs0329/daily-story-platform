import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenerationModule } from './generation/generation.module';
import { PostsEntity } from './posts/entities/posts.entity';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [PostsEntity],
        // ponytail: synchronize is fine for solo MVP dev, switch to migrations before this has real data
        synchronize: config.get('NODE_ENV') !== 'production',
        ssl: { ca: readFileSync(join(__dirname, '..', 'certs', 'supabase-ca.crt')).toString() },
      }),
    }),
    PostsModule,
    GenerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
