import { Link } from 'react-router';
import Button from '@/components/Button';
import useCounterStore from '@/stores/useCounterStore';

function Counter() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <Link className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900" to="/">
            홈으로 돌아가기
          </Link>

          <div className="mt-8 grid gap-3">
            <p className="text-sm font-semibold text-zinc-500">State Management Example</p>
            <h1 className="text-2xl font-bold tracking-normal text-zinc-950">Zustand Counter</h1>
            <p className="text-sm leading-6 text-zinc-600">
              이 페이지는 Zustand store에 저장된 count 값을 읽고, store action을 호출해 전역 상태가 갱신되는 흐름을
              보여줍니다.
            </p>
          </div>

          <div className="mt-7 grid gap-3 text-sm">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-800">Store</p>
              <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-xs text-zinc-700">
                src/stores/useCounterStore.ts
              </code>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-800">Route</p>
              <code className="mt-2 block rounded bg-white px-3 py-2 text-xs text-zinc-700">GET /counter</code>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-800">Update Flow</p>
              <ol className="mt-3 grid gap-2 text-zinc-600">
                <li>1. 컴포넌트에서 count와 action 구독</li>
                <li>2. 버튼 클릭 시 increment/decrement 실행</li>
                <li>3. store의 count 값 변경</li>
                <li>4. 구독 중인 컴포넌트가 새 값으로 렌더링</li>
              </ol>
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2 border-b border-zinc-200 pb-5">
            <p className="text-sm font-semibold text-emerald-700">Live Store Value</p>
            <h2 className="text-xl font-bold tracking-normal text-zinc-950">카운터 상태</h2>
            <p className="text-sm leading-6 text-zinc-600">
              아래 버튼은 같은 Zustand store의 action을 호출합니다. 값은 페이지 안에서만 쓰이지만 store는 앱 전역에서
              재사용할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
              <p className="text-sm font-semibold text-zinc-500">Current Count</p>
              <div className="mt-5 flex items-center justify-center gap-4">
                <Button aria-label="카운터 감소" size="md" variant="minus" onClick={decrement}>
                  -
                </Button>
                <strong className="flex h-24 min-w-32 items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 text-4xl font-bold leading-none text-zinc-950 shadow-sm">
                  {count}
                </strong>
                <Button aria-label="카운터 증가" size="md" variant="plus" onClick={increment}>
                  +
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-sm text-zinc-100 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-semibold">Store Snapshot</p>
                <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">JSON</span>
              </div>
              <pre className="overflow-x-auto text-xs leading-6">
                {JSON.stringify(
                  {
                    count,
                    actions: ['increment', 'decrement'],
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Counter;
