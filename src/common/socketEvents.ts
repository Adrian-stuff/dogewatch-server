// ROOM
export enum RoomSentEvents {
  USER_JOINED = "userJoined",
  USER_LEAVE = "userLeave",
}
export enum RoomReceivedEvents {
  JOIN_ROOM = "joinRoom",
  CREATE_ROOM = "createRoom",
  USER_LEAVE = "userLeave",
}

// PLAYER
export enum PlayerSentEvents {
  SET_VIDEOID = "setVideoID",
  SET_PLAYERSTATUS = "setPlayerStatus",
  SET_PLAYERTIMESTAMP = "setPlayerTimestamp",
}

export enum PlayerReceivedEvents {
  SET_VIDEOID = "setVideoID",
  SET_PLAYERSTATUS = "setPlayerStatus",
  SET_PLAYERTIMESTAMP = "setPlayerTimestamp",
}
