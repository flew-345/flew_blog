import { Route, Routes } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import {
  AboutPage,
  ArchivePage,
  ArticlesPage,
  CategoriesPage,
  CategoryPage,
  HomePage,
  NotFoundPage,
  PostPage,
  SearchPage,
} from "./pages/Pages";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:category" element={<CategoryPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/posts/:slug" element={<PostPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
