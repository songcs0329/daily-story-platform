import { BrowserRouter, Routes, Route } from 'react-router';
import Home from '@/pages/Home';
import Counter from '@/pages/Counter';
import Todos from '@/pages/Todos';
import TodoDetail from '@/pages/Todos/TodoDetail';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/counter" element={<Counter />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/todos/:todoId" element={<TodoDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
