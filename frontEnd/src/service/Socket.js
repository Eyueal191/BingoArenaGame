import { io } from "socket.io-client";

const socket = io("https://bingo-fn13.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

const connectSocket = ()=>{
    socket.connect();
    
}
const disconnectSocket = ()=>{
    socket.disconnect();
}
export {socket, connectSocket, disconnectSocket};
