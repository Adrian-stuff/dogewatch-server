import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import {
  PlayerReceivedEvents,
  PlayerSentEvents,
  RoomReceivedEvents,
  RoomSentEvents,
} from "./socketEvents";

export type ServerType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;
export type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>;

export interface ServerToClientEvents {
  // PLAYER
  [PlayerSentEvents.SET_VIDEOID]: (videoID: string) => void;
  [PlayerSentEvents.SET_PLAYERSTATUS]: (status: number) => void;
  [PlayerSentEvents.SET_PLAYERTIMESTAMP]: (time: number) => void;
  // ROOM
  [RoomSentEvents.USER_JOINED]: (username: string) => void;
  [RoomSentEvents.USER_LEAVE]: (username: string) => void;
}

type callback = ({
  success,
  message,
  data,
}: {
  success: boolean;
  message: string;
  data?: any;
}) => void;

interface CreateRoomType {
  roomID: string;
  username: string;
}

export interface ClientToServerEvents {
  // PLAYER
  [PlayerReceivedEvents.SET_VIDEOID]: (videoID: string) => void;
  [PlayerReceivedEvents.SET_PLAYERSTATUS]: (status: number) => void;
  [PlayerReceivedEvents.SET_PLAYERTIMESTAMP]: (time: number) => void;
  // ROOM
  [RoomReceivedEvents.CREATE_ROOM]: (
    { roomID, username }: CreateRoomType,
    callback: callback
  ) => void;
  [RoomReceivedEvents.JOIN_ROOM]: (
    { roomID, username }: CreateRoomType,
    callback: callback
  ) => void;
  [RoomReceivedEvents.USER_LEAVE]: () => void;
}

export interface SocketData {
  roomID: string;
  username: string;
}
