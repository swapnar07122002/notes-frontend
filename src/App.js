import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import './App.css';
import Login from "./components/Login";
import NoteList from "./components/NoteList";

function App() {
  
  const token = localStorage.getItem("token");

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={token ? <Navigate to="/notes" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/notes" element={<NoteList />} />
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
