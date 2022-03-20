import { db } from "..";
import { PlayerStatus } from "../common/PlayerStatus";
import { RoomReceivedEvents } from "../common/socketEvents";
import { ServerType, SocketType } from "../common/socketTypes";
import validator from "validator";

export default (io: ServerType, socket: SocketType) => {
  socket.on(RoomReceivedEvents.CREATE_ROOM, ({ username, roomID }, cb) => {
    if (!validator.isEmpty(username) && !validator.isEmpty(roomID)) {
      socket.join(roomID);
      socket.data.roomID = roomID;
      db.insert(
        {
          roomID: roomID,
          playerData: {
            videoID: "vPwaXytZcgI",
            status: PlayerStatus.UNSTARTED,
          },
          users: [{ username: username, isAdmin: true, socketID: socket.id }],
        },
        (e, res) => {
          if (e) {
            cb({ success: false, message: e.message });
          }
          cb({
            success: true,
            message: "successfully created a room",
            data: {
              username: res.users[0],
              isAdmin: res.users[0].isAdmin,
              playerData: res.playerData,
            },
          });
        }
      );
    }
  });

  socket.on(RoomReceivedEvents.JOIN_ROOM, ({ roomID, username }, cb) => {
    if (!validator.isEmpty(username) && !validator.isEmpty(roomID)) {
      socket.join(roomID);
      socket.data.roomID = roomID;

      let playerData: {
        videoID: string;
        status: number;
        time?: number | undefined;
      };
      db.findOne({ roomID: roomID }, (e, doc) => {
        playerData = doc.playerData;
      });

      db.update(
        { roomID: roomID },
        {
          $push: {
            users: { username: username, isAdmin: false, socketID: socket.id },
          },
        },
        {},
        (e) => {
          if (!e) {
            cb({
              success: true,
              message: `successfully joined ${roomID}`,
              data: {
                playerData: playerData,
              },
            });
            return;
          }
          cb({ success: false, message: e.message });
        }
      );
    }
  });
};
