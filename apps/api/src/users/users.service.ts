import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsersEntity } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
  ) {}

  async upsertByKakaoId(kakaoId: string, nickname: string, profileImageUrl: string | null): Promise<UsersEntity> {
    const existing = await this.userRepository.findOneBy({ kakaoId });
    if (existing) {
      existing.nickname = nickname;
      existing.profileImageUrl = profileImageUrl;
      return this.userRepository.save(existing);
    }

    const user = this.userRepository.create({ kakaoId, nickname, profileImageUrl });
    return this.userRepository.save(user);
  }

  findByIds(ids: number[]): Promise<UsersEntity[]> {
    return this.userRepository.findBy({ id: In(ids) });
  }
}
