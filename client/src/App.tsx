import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RoomProvider } from "./context/RoomContext";
import Home from "./pages/Home";
import Room from "./pages/Room";
import { useEffect } from "react";
function App() {
  return (
    <div className="bg-stone-600	w-full h-screen">
      <BrowserRouter>
        <RoomProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:id?" element={<Room />} />
          </Routes>
        </RoomProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
