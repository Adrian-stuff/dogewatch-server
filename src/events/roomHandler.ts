import { db, Document } from "..";
import { PlayerStatus } from "../common/PlayerStatus";
import {
  PlayerSentEvents,
  RoomReceivedEvents,
  RoomSentEvents,
} from "../common/socketEvents";
import { ServerType, SocketType } from "../common/socketTypes";
import validator from "validator";

export default (io: ServerType, socket: SocketType) => {
  socket.on(RoomReceivedEvents.CREATE_ROOM, ({ username, roomID }, cb) => {
    if (!validator.isEmpty(username) && !validator.isEmpty(roomID)) {
      if (db.findOne({ roomID: roomID }, (e, doc) => doc) === null) {
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
              return cb({ success: false, message: e.message });
            }
            socket.join(roomID);
            socket.data.roomID = roomID;
            socket.data.username = username;
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
      } else {
        cb({ success: false, message: "room already exists" });
      }
    }
  });

  socket.on(RoomReceivedEvents.JOIN_ROOM, ({ roomID, username }, cb) => {
    if (!validator.isEmpty(username) && !validator.isEmpty(roomID)) {
      if (db.findOne({ roomID: roomID }, (e, doc) => doc) !== null) {
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
              users: {
                username: username,
                isAdmin: false,
                socketID: socket.id,
              },
            },
          },
          {},
          (e) => {
            if (e) return cb({ success: false, message: e.message });
            socket.join(roomID);
            socket.data.roomID = roomID;
            socket.data.username = username;
            cb({
              success: true,
              message: `successfully joined ${roomID}`,
              data: {
                playerData: playerData,
              },
            });
            // emit userjoined
            socket.emit(RoomSentEvents.USER_JOINED, username);
          }
        );
      } else {
        cb({ success: false, message: "room doesn't exist" });
      }
    }
  });

  socket.on(RoomReceivedEvents.USER_LEAVE, () => {
    db.update(
      { roomID: socket.data.roomID },
      { $pull: { users: { socketID: socket.id } } },
      {},
      (e) => {
        if (e) return console.log(e);
        if (
          socket.data.roomID !== undefined &&
          socket.data.username !== undefined
        ) {
          // userLeave
          socket.broadcast
            .to(socket.data.roomID)
            .emit(RoomSentEvents.USER_LEAVE, socket.data.username);

          // remove room if no users
          db.findOne({ roomID: socket.data.roomID }, (e, doc) => {
            if (e) return console.log(e);
            // check if no user in room

            // delete room
            if (doc.users.length === 0)
              db.remove({ roomID: socket.data.roomID });
          });
          socket.leave(socket.data.roomID);
          socket.data.roomID = undefined;
        }
      }
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(`user disconnected ${socket.id} reason: ${reason}`);
    if (
      socket.data.roomID !== undefined &&
      socket.data.username !== undefined
    ) {
      socket.broadcast
        .to(socket.data.roomID)
        .emit(RoomSentEvents.USER_LEAVE, socket.data.username);
      // remove user from db
      db.update(
        { roomID: socket.data.roomID },
        { $pull: { users: { socketID: socket.id } } }
      );

      // remove room if no users
      db.findOne({ roomID: socket.data.roomID }, (e, doc) => {
        if (e) return console.log(e);
        // check if no user in room
        if (doc.users.length === 0)
          // delete room
          db.remove({ roomID: socket.data.roomID });
      });

      socket.leave(socket.data.roomID);
      socket.data.roomID = undefined;
    }
  });
  // socket.on("disconnect", (reason) => {
  //   console.log(`user disconnected ${socket.id} reason: ${reason}`);
  // });
};
