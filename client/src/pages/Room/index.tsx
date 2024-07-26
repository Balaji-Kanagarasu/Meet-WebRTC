import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { IRoomContextValues } from "../../common/interface";
import ShareScreenButton from "../../components/ShareScreenButton";
import { VideoPlayer } from "../../components/VideoPlayer";
import { RoomContext } from "../../context/RoomContext";
import { ws } from "../../socket";
import "./styles.css";

const Room: React.FC = () => {
  const location: any = useLocation();
  const { roomId } = location?.state ?? {};
  const {
    myPeer,
    stream,
    peers,
    shareScreen,
    screenStream,
    setScreenStream,
    screenPeerId,
    setRoomId,
  }: IRoomContextValues = useContext(RoomContext);

  useEffect(() => {
    if (setRoomId) {
      setRoomId(roomId);
    }
    if (myPeer) {
      myPeer.on("open", () => {
        ws.emit("join-room", { roomId, peerId: myPeer?._id });
      });
    }
  }, [roomId, ws, myPeer]);

  /**
   * To stop sharing the screen manually.
   */
  const stopSharing = () => {
    setScreenStream(null);
    const tracks = screenStream.getTracks();
    tracks.forEach((track) => track.stop());
  };

  console.log("screenPeerId", {
    screenPeerId,
    new: peers[screenPeerId],
  });

  return (
    <div className="p-4 relative h-full flex flex-col items-center">
      <h2 className="bg-neutral-300 top-3 text-center p-1 rounded-lg shadow-custom mb-9 w-full">
        <p className="text-2xl font-bold text-emerald-500 hover:text-shadow-emerald transition-shadow duration-300">
          Room id {roomId}
        </p>
      </h2>
      {!!screenStream && (
        <div className="h-3/4 flex justify-center w-7/12">
          <VideoPlayer
            className={"relative flex justify-center h-full"}
            userDetails={{
              name: "Stop Sharing",
              onclick: stopSharing,
            }}
            stream={screenStream}
          />
        </div>
      )}
      <div
        className={
          !screenStream && !Object.values(peers).length
            ? "flex justify-center h-3/4 w-2/3"
            : ""
        }
      >
        <VideoPlayer
          className={
            Object.values(peers).length || !!screenStream
              ? "absolute bottom-24 right-8 w-60"
              : `relative flex justify-center h-full w-3/4`
          }
          userDetails={{
            name: "You",
          }}
          stream={stream}
        />
      </div>
      {!screenStream && Object.values(peers).length > 0 && (
        <div className="grid grid-cols-4 gap-6">
          {Object.values(peers)
            .filter((peer) => !!peer.stream)
            .map((peer: any, index: number) => {
              return (
                <VideoPlayer
                  key={peer?.stream?.id + index}
                  index={index}
                  stream={peer.stream}
                />
              );
            })}
          {peers?.[screenPeerId]?.stream && (
            <VideoPlayer stream={peers?.[screenPeerId]?.stream} />
          )}
        </div>
      )}

      <div className="fixed bg-neutral-300 bottom-3 right-8 left-8 z-[999] flex items-center justify-center p-1 rounded-lg shadow-custom space-x-3">
        <ShareScreenButton onClick={shareScreen} />
      </div>
    </div>
  );
};

export default Room;
