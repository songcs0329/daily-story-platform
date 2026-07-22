import { Link } from 'react-router';
import Button from '@/components/Button';
import { cn } from '@/libs/utils/cn';
import useTodoForm, { priorityOptions } from '@/hooks/useTodoForm';

const priorityStyles = {
  low: {
    selected: 'border-sky-600 bg-sky-50 text-sky-800',
    badge: 'bg-sky-100 text-sky-800',
  },
  medium: {
    selected: 'border-emerald-600 bg-emerald-50 text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  high: {
    selected: 'border-rose-600 bg-rose-50 text-rose-800',
    badge: 'bg-rose-100 text-rose-800',
  },
} satisfies Record<(typeof priorityOptions)[number]['value'], { selected: string; badge: string }>;

function Todos() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    selectedPriority,
    memoLength,
    todos,
    onSubmit,
    removeTodo,
    getPriorityLabel,
  } = useTodoForm();

  return (
    <main className="min-h-screen bg-stone-50 px-5 py-8 text-zinc-900 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <Link className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-900" to="/">
            홈으로 돌아가기
          </Link>

          <div className="mb-7 mt-8 flex flex-col gap-2">
            <p className="text-sm font-semibold text-emerald-700">React Hook Form + Zod</p>
            <h1 className="text-2xl font-bold tracking-normal text-zinc-950 sm:text-3xl">Todo 작성</h1>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-800" htmlFor="title">
                할 일
              </label>
              <input
                id="title"
                className={cn(
                  'h-11 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100',
                  errors.title && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                )}
                placeholder="예: 과제용 폼 검증 예제 정리"
                {...register('title')}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-zinc-800">우선순위</label>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex h-10 cursor-pointer items-center justify-center rounded-md border border-zinc-300 bg-white text-sm font-medium text-zinc-700 transition',
                      selectedPriority === option.value && priorityStyles[option.value].selected,
                    )}
                  >
                    <input className="sr-only" type="radio" value={option.value} {...register('priority')} />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-zinc-800" htmlFor="memo">
                  메모
                </label>
                <span className={cn('text-xs text-zinc-500', memoLength > 100 && 'text-amber-700')}>
                  {memoLength}/120
                </span>
              </div>
              <textarea
                id="memo"
                className={cn(
                  'min-h-28 resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100',
                  errors.memo && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                )}
                placeholder="필요한 맥락을 짧게 남겨보세요."
                {...register('memo')}
              />
              {errors.memo && <p className="text-sm text-red-600">{errors.memo.message}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                등록
              </Button>
            </div>
          </form>
        </section>

        <aside className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-zinc-500">Todo 목록</p>
            <span className="text-sm font-semibold text-emerald-700">{todos.length}개</span>
          </div>

          {todos.length > 0 ? (
            <ul className="mt-5 grid gap-3">
              {todos.map((todo) => (
                <li key={todo.id} className="grid gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-base font-semibold text-zinc-950">{todo.title}</p>
                      <span
                        className={cn(
                          'mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold',
                          priorityStyles[todo.priority].badge,
                        )}
                      >
                        {getPriorityLabel(todo.priority)}
                      </span>
                    </div>
                    <Button type="button" variant="danger" size="sm" onClick={() => removeTodo(todo.id)}>
                      삭제
                    </Button>
                  </div>
                  {todo.memo && <p className="break-words text-sm leading-6 text-zinc-600">{todo.memo}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-md border border-dashed border-zinc-300 p-4 text-sm leading-6 text-zinc-500">
              아직 등록된 Todo가 없습니다.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default Todos;
