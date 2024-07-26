import { Socket } from "socket.io";
import { IRoomParams } from "src/types/interface";
import { v4 as uuidV4 } from "uuid";

/**
 * To store the room data.
 */
const rooms: Record<string, string[]> = {};

/**
 * To handle room functions.
 */
export const roomHandler = (socket: Socket) => {
  // console.log("Enter in roomHandler");
  /** To create a New room */
  const createRoom = (peerId?: string) => {
    // console.log("Enter in createRoom");
    const roomId = uuidV4();
    rooms[roomId] = [];
    socket.emit("room-created", { roomId });
    joinRoom({ roomId, peerId });
  };
  /** To handle the user join in  the room */
  const joinRoom = ({ roomId, peerId }: IRoomParams) => {
    console.log("Enter in joinRoom", { roomId, peerId });
    if (rooms[roomId]) {
      rooms[roomId].push(peerId as any);
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", { roomId, peerId });
      socket.emit("get-users", {
        roomId,
        participants: rooms[roomId],
      });
    } else {
      createRoom(peerId);
    }
    socket.on("disconnect", () => {
      console.log("user disconnected ", peerId);
      leaveRoom({ roomId, peerId });
    });
  };
  /** To remove the user | peer if the leave the room */
  const leaveRoom = ({ roomId, peerId }: IRoomParams) => {
    console.log("Enter in joinRoom", { roomId, peerId });
    socket.to(roomId).emit("user-disconnected", peerId);
    rooms[roomId] = rooms[roomId]?.filter((id) => id !== peerId);
  };
  const startSharing = ({ roomId, peerId }: IRoomParams) => {
    console.log("🚀 ~ startSharing ~ startSharing:");
    socket.to(roomId).emit("user-start-sharing", peerId);
  };
  const stopSharing = ({ roomId }: IRoomParams) => {
    socket.to(roomId).emit("user-stop-sharing");
  };
  // Listener for create room
  socket.on("create-room", createRoom);
  // Listener for join room
  socket.on("join-room", joinRoom);
  // Listener for leave room
  socket.on("leave-room", leaveRoom);
  socket.on("start-sharing", startSharing);
  socket.on("stop-sharing", stopSharing);
};
