import { Controller, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerationService } from './generation.service';

@Controller('generation')
export class GenerationController {
  constructor(
    private readonly generationService: GenerationService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  run(@Headers('x-generation-secret') secret: string) {
    if (secret !== this.config.get<string>('GENERATION_SECRET')) {
      throw new UnauthorizedException();
    }
    return this.generationService.generateTodayPost();
  }
}
