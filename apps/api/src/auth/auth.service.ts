import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import type { User } from 'shared';

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithKakao(kakaoAccessToken: string): Promise<{ accessToken: string; user: User }> {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${kakaoAccessToken}` },
    });
    if (!response.ok) {
      throw new UnauthorizedException('Invalid Kakao access token');
    }

    const kakaoUser = (await response.json()) as KakaoUserResponse;
    const profile = kakaoUser.kakao_account?.profile;
    const entity = await this.usersService.upsertByKakaoId(
      String(kakaoUser.id),
      profile?.nickname ?? '익명',
      profile?.profile_image_url ?? null,
    );

    const accessToken = this.jwtService.sign({ sub: entity.id });
    return {
      accessToken,
      user: { id: entity.id, nickname: entity.nickname, profileImageUrl: entity.profileImageUrl },
    };
  }
}
