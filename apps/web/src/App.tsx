import { BrowserRouter, Routes, Route } from 'react-router';
import Login from '@/pages/Login';
import Posts from '@/pages/Posts';
import PostDetail from '@/pages/Posts/PostDetail';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
