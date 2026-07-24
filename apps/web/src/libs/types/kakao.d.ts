interface KakaoAuthLoginResponse {
  access_token: string;
}

interface Window {
  Kakao?: {
    init: (jsKey: string) => void;
    isInitialized: () => boolean;
    Auth: {
      login: (options: { success: (response: KakaoAuthLoginResponse) => void; fail: (error: unknown) => void }) => void;
    };
  };
}
