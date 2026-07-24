import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { Repository } from 'typeorm';
import { GenresEntity } from '../genres/entities/genres.entity';
import { PostsEntity } from '../posts/entities/posts.entity';

@Injectable()
export class GenerationService {
  private readonly ai: GoogleGenAI;
  private readonly supabase: ReturnType<typeof createClient>;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(GenresEntity)
    private readonly genresRepository: Repository<GenresEntity>,
  ) {
    this.ai = new GoogleGenAI({ apiKey: this.config.get<string>('GEMINI_API_KEY') });
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL')!,
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async generateTodayPost(): Promise<PostsEntity> {
    const genre = await this.pickRandomGenre();
    const { title, content } = await this.generateStory(genre);
    const thumbnailUrl = await this.generateThumbnail(title, genre);

    const post = this.postsRepository.create({
      title,
      content,
      thumbnailUrl,
      genre: genre.slug,
      viewCount: 0,
      publishedAt: new Date().toISOString(),
    });

    return this.postsRepository.save(post);
  }

  // ponytail: 장르 개수가 적어(수 개) 전체 fetch 후 랜덤 선택, PostgREST와 동일 방식으로 통일
  private async pickRandomGenre(): Promise<GenresEntity> {
    const genres = await this.genresRepository.find();
    if (genres.length === 0) {
      throw new Error('genres 테이블에 등록된 장르가 없습니다');
    }
    return genres[Math.floor(Math.random() * genres.length)];
  }

  private async generateStory(genre: GenresEntity): Promise<{ title: string; content: string }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: genre.storyPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['title', 'content'],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}') as { title?: string; content?: string };
    if (!parsed.title || !parsed.content) {
      throw new Error('Gemini did not return title/content');
    }
    return { title: parsed.title, content: parsed.content };
  }

  private async generateThumbnail(title: string, genre: GenresEntity): Promise<string> {
    const prompt = `"${title}"라는 제목의 ${genre.label} 단편소설 표지용 썸네일 이미지를 그려줘. 텍스트나 글자는 넣지 말고, 분위기 있는 일러스트로.`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: { responseModalities: ['IMAGE'] },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      throw new Error('Gemini did not return an image');
    }

    const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
    const path = `${Date.now()}.png`;

    const { error } = await this.supabase.storage.from('thumbnails').upload(path, buffer, {
      contentType: 'image/png',
    });
    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('thumbnails').getPublicUrl(path);
    return publicUrl;
  }
}
