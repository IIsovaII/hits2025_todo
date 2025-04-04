import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/Home';
import TodoDetailPage from "../pages/TodoDetail.tsx";
import NotFoundPage from '../pages/NotFound';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<HomePage/>}/>
                    <Route path="todos/:id" element={<TodoDetailPage/>}/>
                    <Route path="404" element={<NotFoundPage/>}/>
                    <Route path="*" element={<Navigate to="/404"/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;