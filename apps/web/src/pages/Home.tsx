import { Link } from 'react-router';

function Home() {
  const examples = [
    {
      to: '/counter',
      title: 'Zustand Counter',
      description: '전역 store의 상태와 액션을 컴포넌트에서 구독하는 가장 작은 예제입니다.',
      label: 'State Management',
    },
    {
      to: '/todos',
      title: 'Todo Form',
      description: 'React Hook Form과 Zod로 입력값을 검증하고 로컬 목록을 관리합니다.',
      label: 'Form Validation',
    },
    {
      to: '/todos/1',
      title: 'Todo Detail',
      description: 'URL 파라미터, TanStack Query, Axios 래퍼를 연결해 API 응답을 렌더링합니다.',
      label: 'API Fetching',
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-emerald-700">Vite React Template</p>
          <h1 className="mt-3 text-2xl font-bold tracking-normal text-zinc-950 sm:text-3xl">예제 라우트 모음</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            각 기능 예제를 별도 라우트로 분리해 필요한 흐름만 빠르게 확인할 수 있도록 구성했습니다.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {examples.map((example) => (
            <Link
              key={example.to}
              to={example.to}
              className="group grid min-h-48 content-between rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
            >
              <div>
                <span className="inline-flex rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  {example.label}
                </span>
                <h2 className="mt-4 text-xl font-bold tracking-normal text-zinc-950">{example.title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{example.description}</p>
              </div>
              <span className="mt-5 text-sm font-semibold text-zinc-500 transition group-hover:text-emerald-700">
                예제 열기
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Home;
