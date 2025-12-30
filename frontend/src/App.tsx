import { Routes, Route } from "react-router-dom";
import ArticleList from "./pages/ArticleList";
import ArticleDetails from "./pages/ArticleDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ArticleList />} />
      <Route path="/article/:id" element={<ArticleDetails />} />
    </Routes>
  );
}

export default App;
