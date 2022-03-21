require("dotenv").config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import axios from "axios";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketType,
} from "./common/socketTypes";
import registerPlayerHandler from "./events/playerHandler";
import registerRoomHandler from "./events/roomHandler";
import DataStore from "nedb";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

// init db

export type Document = {
  roomID: string;
  playerData: { videoID: string; status: number; time?: number };
  users: { username: string; isAdmin: boolean; socketID: string }[];
};

export const db = new DataStore<Document>();

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// app.use(cors({ origin: "https://doge-watch.web.app" }));
app.use(
  cors({ origin: ["http://localhost:8080", "http://192.168.1.10:8080"] })
);

const PORT = process.env.PORT || 8000;
const API_URI = "https://www.googleapis.com/youtube/v3/";

app.get("/search", async (req: any, res: any) => {
  const response = await axios
    .get(
      `${API_URI}search?part=snippet&maxResults=15&q=${req.query.q}&key=${process.env.API_KEY}`
    )
    .then((data: any) => {
      console.log(data);
      return data.data;
    })
    .catch((e: any) => console.log(e));
  console.log(response);
  res.json(response);
});

const onConnection = (socket: SocketType) => {
  console.log(`user connected ${socket.id}`);
  socket.use(([event, args], next) => {
    console.log(event, args, socket.id);

    next();
  });

  registerPlayerHandler(io, socket);
  registerRoomHandler(io, socket);
};
io.on("connection", onConnection);

httpServer.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
