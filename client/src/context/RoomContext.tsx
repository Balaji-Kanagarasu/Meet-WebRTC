import Peer from "peerjs";
import React, { createContext, useEffect, useReducer, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import { ws } from "../socket";
import { addPeerActions, removePeerActions } from "./PeerActions";
import { peerReducer } from "./peerReducer";
import { ExtendedPeer } from "../common/interface";

export const RoomContext = createContext<null | any>(null);

type TProps = {
  children: JSX.Element;
};
export const RoomProvider: React.FunctionComponent<TProps> = ({ children }) => {
  const navigate: NavigateFunction = useNavigate();
  const [myPeer, setMyPeer] = useState<ExtendedPeer | null>(null); // Peer for the current user.
  const [peers, dispatch] = useReducer(peerReducer, {});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenPeerId, setScreenPeerId] = useState<string>(""); // Peer Id for screen sharing.
  const [roomId, setRoomId] = useState<string>(""); // Used for screen sharing.

  /**
   * Function responsible to enter into the room
   */
  const enterRoom = ({ roomId }: { roomId: string }) => {
    if (roomId) {
      navigate("/room", {
        state: {
          roomId,
        },
      });
    } else {
      alert("Room Id not found");
    }
  };

  const handleUserList = ({ participants }: { participants: string[] }) => {
    participants.map((peerId) => {
      const call = stream && myPeer?.call(peerId, stream);
      call?.on("stream", (userVideoStream: MediaStream) => {
        console.log({ addPeerActions });
        dispatch(addPeerActions(peerId, userVideoStream));
      });
    });
  };

  /**
   * To remove the disconnected Peer (User)
   */
  const removePeer = (peerId: string) => {
    dispatch(removePeerActions(peerId));
  };

  /**
   * Function to screen share.
   * And update the stream to null if the sharing is stopped.
   */
  const shareScreen = () => {
    try {
      navigator.mediaDevices
        .getDisplayMedia({
          video: true,
        })
        .then((mediaStream) => {
          mediaStream.getTracks().forEach((track) => {
            track.onended = () => {
              setScreenStream(null);
            };
          });
          setScreenStream(mediaStream);
          Object.values(peers).forEach((remoteStream, index) => {
            console.log("🚀 ~ Object.values ~ remoteStream:", remoteStream);
            const call = myPeer?.call(myPeer?._id, stream as MediaStream);
            call?.on("stream", (remoteStream) => {
              const tempPeer: any = myPeer;
              dispatch(addPeerActions(tempPeer?._id, remoteStream));
              setScreenPeerId(tempPeer?._id || "");
            });
          });
        })
        .catch((error) => {
          console.error("Error", error);
        });
    } catch (error) {
      console.error("Error in shareScreen:", error);
    }
  };

  useEffect(() => {
    // To create a Peer for the user with uniq Id.
    const myUniqPeerId = uuidV4();
    const newPeer = new Peer(myUniqPeerId);
    setMyPeer(newPeer as ExtendedPeer);
    try {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((newStream) => {
          setStream(newStream);
        })
        .catch((error) => {
          console.error("Error in getUserMedia", error);
        });
    } catch (error) {
      console.error("🚀 ~ Error in getUserMedia:", error);
    }

    ws.on("room-created", enterRoom);
    ws.on("get-users", handleUserList);
    ws.on("user-disconnected", removePeer);
    ws.on("user-start-sharing", setScreenPeerId);
    ws.on("user-stop-sharing", () => setScreenPeerId(""));
  }, []);

  useEffect(() => {
    if (!stream) return;
    if (!myPeer) return;

    ws.on("user-joined", ({ peerId }: { peerId: string }) => {
      const call = stream && myPeer.call(peerId, stream);
      call.on("stream", (userVideoStream: MediaStream) => {
        dispatch(addPeerActions(peerId, userVideoStream));
      });
    });

    myPeer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        dispatch(addPeerActions(call.peer, userVideoStream));
      });
    });
  }, [stream, myPeer]);

  /**
   * Effect to handle screen sharing.
   */
  useEffect(() => {
    if (screenPeerId) {
      ws.emit("start-sharing", { roomId, peerId: screenPeerId });
    } else {
      ws.emit("stop-sharing", { roomId });
    }
  }, [screenPeerId, roomId]);

  return (
    <RoomContext.Provider
      value={{
        myPeer,
        stream,
        peers,
        shareScreen,
        screenStream,
        setScreenStream,
        screenPeerId,
        setRoomId,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
