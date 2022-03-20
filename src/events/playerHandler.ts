import { PlayerReceivedEvents, PlayerSentEvents } from "../common/socketEvents";
import { ServerType, SocketType } from "../common/socketTypes";
import validator from "validator";
import { db } from "..";
import { PlayerStatus } from "../common/PlayerStatus";
export default (io: ServerType, socket: SocketType) => {
  socket.on(PlayerReceivedEvents.SET_VIDEOID, (videoID) => {
    if (!validator.isEmpty(videoID)) {
      db.update(
        { roomID: socket.data.roomID },
        {
          $set: {
            "playerData.videoID": videoID,
            "playerData.status": PlayerStatus.UNSTARTED,
          },
        },
        {},
        (e) => {
          if (!e) {
            if (socket.data.roomID !== undefined)
              socket.broadcast
                .to(socket.data.roomID)
                .emit(PlayerSentEvents.SET_VIDEOID, videoID);
          }
        }
      );
    }
  });

  socket.on(PlayerReceivedEvents.SET_PLAYERTIMESTAMP, (time) => {
    db.update(
      { roomID: socket.data.roomID },
      { $set: { "playerData.time": time } },
      {},
      (e) => {
        if (!e) {
          if (socket.data.roomID !== undefined)
            socket.broadcast
              .to(socket.data.roomID)
              .emit(PlayerSentEvents.SET_PLAYERTIMESTAMP, time);
        }
      }
    );
  });

  socket.on(PlayerReceivedEvents.SET_PLAYERSTATUS, (status) => {
    db.update(
      { roomID: socket.data.roomID },
      { $set: { "playerData.status": status } },
      {},
      (e) => {
        if (!e) {
          if (socket.data.roomID !== undefined) {
            socket.broadcast
              .to(socket.data.roomID)
              .emit(PlayerSentEvents.SET_PLAYERSTATUS, status);
          }
        }
      }
    );
  });
};
