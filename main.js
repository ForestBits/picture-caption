const config = require("./config.json");
const express = require("express");
const app = express();
const WebSocket = require("ws");
const wss = new WebSocket.Server({port: config.websocket_port});

const Timer = require("./timer.js");
const StartState = require("./start-state.js");
const NameSelectionState = require("./name-selection-state.js");
const Session = require("./session.js");
const Room = require("./room.js");

const rooms = [];

let debugRoom = null;


if (config.debug)
{
    debugRoom = new Room();

    if (config.debug.state === "NAME_SELECTION")
        debugRoom.setState(new NameSelectionState());
}

wss.on("connection", (socket, request) =>
{
    //while debugging, don't let extra players join
    if (config.debug && debugRoom.sessions.length >= config.debug.players_needed)
    {
        socket.close();

        //send actual close message

        return;
    }

    console.log(`Connection from ${request.connection.remoteAddress}`);

    const session = new Session(socket);

    session.on("socketError", (error) => {onSocketError(session, error);});
    session.on("socketClose", (close) => {onSocketClose(session, close);});
    session.on("socketMessage", (message) => {onSocketMessage(session, message);});

    const sessionPacket =
    {
        type: "SESSION_START",
        session_token: session.token
    };

    //while debugging, send client debug config
    if (config.debug)
        sessionPacket.debug = config.debug;

    session.sendPacket(sessionPacket);

    const room = getRoomForNewSession(session);

    //the following call needs to happen slightly later because the
    //room might not be setup yet, and because the room setup code
    //runs AFTER the current script execution, this code must also
    //be delayed

    setTimeout(() => addSessionToRoom(session, room));
});

function onSocketError(session, error)
{
    if (session.room)
        session.room.onSessionError(session, error);
}

function onSocketClose(session, close)
{
    if (session.room)
        session.room.onSessionClose(session, close);
}

function onSocketMessage(session, message)
{
    const packet = JSON.parse(message);

    console.log("Received packet: %o", packet);

    if (session.room)
        session.room.onSessionMessage(session, packet);
}

app.use(express.static("frontend"));

app.listen(config.web_port, () => {});


function getRoomForNewSession(session)
{
    //in debug mode only one room is running
    if (config.debug)
        return debugRoom;

    //find a room that is waiting for players and isn't yet filled up
    //else create a new empty room and we will assign the player to that instead
    //there may be more than one room waiting for players at once,
    //but ALL new sessions will be directed to the same room rather than
    //split among several rooms, because we want as many filled rooms as possible

    for (const room of rooms)
        if (room.state.name === "WAITING_FOR_PLAYERS"
         && room.sessions.length < config.room_max_players)
        {
            //this room will suffice
            return room;
        }

    //if we reached this point, a suitable room was not found
    //create a new room

    const room = new Room();

    room.setState(new StartState());

    rooms.push(room);

    return room;
}

function addSessionToRoom(session, room)
{
    room.sessions.push(session);

    session.room = room;

    //the starting state room needs to know when new sessions join
    //no other room needs to know this information
    //so we pass it as a packet instead
    const newSessionPacket =
    {
        type: "NEW_SESSION"
    };

    room.state.onSessionMessage(session, newSessionPacket);
}