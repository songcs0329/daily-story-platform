import { Link, useParams } from 'react-router';
import useGetTodo from '@/hooks/useGetTodo';

function TodoDetail() {
  const { todoId } = useParams<{ todoId: string }>();
  const todoIdNumber = todoId ? Number(todoId) : undefined;
  const isValidTodoId = Number.isInteger(todoIdNumber) && Number(todoIdNumber) > 0;
  const requestPath = isValidTodoId ? `/todos/${todoIdNumber}` : '/todos/:todoId';
  const { data: todo, isLoading, isError } = useGetTodo(isValidTodoId ? todoIdNumber : undefined);

  const renderContent = () => {
    if (!isValidTodoId) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          URL의 todoId가 올바르지 않습니다. 예시로 <span className="font-semibold">/todos/1</span>처럼 숫자 ID를 입력해
          주세요.
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="grid gap-4">
          <div className="h-24 animate-pulse rounded-lg bg-zinc-100" />
          <div className="h-36 animate-pulse rounded-lg bg-zinc-100" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-800">
          API 요청 중 오류가 발생했습니다. 개발 서버의 프록시 설정과 VITE_APP_API_URL 값을 확인해 주세요.
        </div>
      );
    }

    if (!todo) {
      return (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 text-sm leading-6 text-zinc-600">
          해당 ID의 Todo 데이터를 찾을 수 없습니다.
        </div>
      );
    }

    return (
      <article className="grid gap-5">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-700">Fetched Todo</p>
            <h2 className="mt-2 break-words text-2xl font-bold tracking-normal text-zinc-950">{todo.title}</h2>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <dt className="text-xs font-semibold uppercase text-zinc-500">Todo ID</dt>
            <dd className="mt-2 text-xl font-bold text-zinc-950">{todo.id}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <dt className="text-xs font-semibold uppercase text-zinc-500">User ID</dt>
            <dd className="mt-2 text-xl font-bold text-zinc-950">{todo.userId}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <dt className="text-xs font-semibold uppercase text-zinc-500">Completed</dt>
            <dd className="mt-3 grid gap-2">
              <span
                className={`inline-flex w-fit items-center rounded-md px-3 py-1 text-sm font-semibold ${
                  todo.completed
                    ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
                    : 'bg-sky-100 text-sky-800 ring-1 ring-sky-200'
                }`}
              >
                {todo.completed ? 'Completed' : 'In Progress'}
              </span>
              <span className="text-xs leading-5 text-zinc-500">
                API value: <span className="font-semibold text-zinc-700">{todo.completed.toString()}</span>
              </span>
            </dd>
          </div>
        </dl>

        <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-5 text-sm text-zinc-100 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-semibold">Response Shape</p>
            <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">JSON</span>
          </div>
          <pre className="overflow-x-auto text-xs leading-6">
            {JSON.stringify(
              {
                userId: todo.userId,
                id: todo.id,
                title: todo.title,
                completed: todo.completed,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <Link className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900" to="/">
            홈으로 돌아가기
          </Link>

          <div className="mt-8 grid gap-3">
            <p className="text-sm font-semibold text-zinc-500">API Fetching Example</p>
            <h1 className="text-2xl font-bold tracking-normal text-zinc-950">JSONPlaceholder Todo 상세</h1>
            <p className="text-sm leading-6 text-zinc-600">
              이 페이지는 React Router의 URL 파라미터에서 todoId를 읽고, TanStack Query와 Axios 래퍼를 통해 예제 API의
              Todo 데이터를 가져오는 흐름을 보여줍니다.
            </p>
          </div>

          <div className="mt-7 grid gap-3 text-sm">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-800">Source API</p>
              <p className="mt-2 break-all text-zinc-600">https://jsonplaceholder.typicode.com</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-800">Request</p>
              <code className="mt-2 block break-all rounded bg-white px-3 py-2 text-xs text-zinc-700">
                GET {requestPath}
              </code>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-semibold text-zinc-800">Fetch Flow</p>
              <ol className="mt-3 grid gap-2 text-zinc-600">
                <li>1. /todos/:todoId 라우트 진입</li>
                <li>2. useParams로 todoId 추출</li>
                <li>3. useTodo 훅에서 queryKey 생성</li>
                <li>4. Axios GET 요청 후 응답 렌더링</li>
              </ol>
            </div>
          </div>
        </aside>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-2 border-b border-zinc-200 pb-5">
            <p className="text-sm font-semibold text-emerald-700">Live Response</p>
            <h2 className="text-xl font-bold tracking-normal text-zinc-950">요청 결과</h2>
            <p className="text-sm leading-6 text-zinc-600">
              로딩, 에러, 잘못된 ID, 성공 상태를 분리해서 API 요청의 생명주기를 확인할 수 있습니다.
            </p>
          </div>

          {renderContent()}
        </section>
      </div>
    </main>
  );
}

export default TodoDetail;
