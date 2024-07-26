import Peer from "peerjs";
import { Socket } from "socket.io-client";
import { PeerState } from "../context/peerReducer";

// Extend the Peer type
export interface ExtendedPeer extends Peer {
  _id: string; // uniq Id
}

export interface IRoomContextValues {
  ws: Socket;
  myPeer: ExtendedPeer;
  stream: MediaStream;
  peers: PeerState;
  shareScreen: () => void;
  setScreenStream: React.Dispatch<any>;
  screenStream: MediaStream;
  screenPeerId: string;
  setRoomId: React.Dispatch<string>;
}

export interface IRoomUsers {
  roomId: string;
  participants: string[];
}
