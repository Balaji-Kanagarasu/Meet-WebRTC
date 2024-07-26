import socketIOClient from "socket.io-client";

const wsUrl = "http://localhost:8080";
export const ws = socketIOClient(wsUrl);
