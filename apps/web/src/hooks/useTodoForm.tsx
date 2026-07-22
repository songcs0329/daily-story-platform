import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const priorityOptions = [
  { label: '낮음', value: 'low' },
  { label: '보통', value: 'medium' },
  { label: '높음', value: 'high' },
] as const;

const todoFormSchema = z.object({
  title: z.string().trim().min(2, '할 일은 2자 이상 입력해 주세요.').max(40, '할 일은 40자 이하로 입력해 주세요.'),
  priority: z.enum(['low', 'medium', 'high']),
  memo: z.string().max(120, '메모는 120자 이하로 입력해 주세요.').optional(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
export type TodoItem = TodoFormValues & { id: number };

const defaultValues: TodoFormValues = {
  title: '',
  priority: 'medium',
  memo: '',
};

export default function useTodoForm() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const selectedPriority = watch('priority');
  const memoLength = watch('memo')?.length ?? 0;

  const onSubmit = (values: TodoFormValues) => {
    setTodos((currentTodos) => [{ ...values, id: Date.now() }, ...currentTodos]);
    reset(defaultValues);
  };

  const removeTodo = (todoId: number) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
  };

  const getPriorityLabel = (priority: TodoFormValues['priority']) => {
    return priorityOptions.find((option) => option.value === priority)?.label ?? '보통';
  };

  return {
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
  };
}
