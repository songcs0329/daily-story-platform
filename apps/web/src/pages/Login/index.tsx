import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import apiManager from '@/libs/apis/apiManager';
import useAuthStore from '@/stores/useAuthStore';

function Login() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/posts', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleKakaoLogin = () => {
    if (!window.Kakao) return;
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }

    window.Kakao.Auth.login({
      success: async ({ access_token: kakaoAccessToken }) => {
        const { data } = await apiManager.kakaoLogin(kakaoAccessToken);
        login(data.user, data.accessToken);
        navigate('/posts');
      },
      fail: (error) => {
        console.error('카카오 로그인 실패', error);
      },
    });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 px-4">
      <div className="grid w-full max-w-sm gap-6 rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-zinc-950">하루 한 편, 오늘의 이야기</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">매일 새로 쓰인 단편소설을 읽고 댓글을 남겨보세요.</p>
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="rounded-md bg-[#FEE500] px-4 py-3 text-sm font-semibold text-[#191600] transition hover:opacity-90"
        >
          카카오로 로그인
        </button>

        <button
          type="button"
          onClick={() => navigate('/posts')}
          className="text-sm font-semibold text-zinc-500 transition hover:text-zinc-700"
        >
          로그인 없이 둘러보기
        </button>
      </div>
    </main>
  );
}

export default Login;
