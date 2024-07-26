import React from "react";
import { ws } from "../../socket";

export const CreateButton: React.FC = () => {
  const createRoom = () => {
    ws.emit("create-room");
  };
  return (
    <button
      className="bg-rose-400 py-2 px-8 rounded-lg text-xl hover:bg-rose-600 text-white"
      onClick={createRoom}
    >
      Start new meeting
    </button>
  );
};
