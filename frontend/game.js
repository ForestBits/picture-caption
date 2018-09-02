const waitingForStartStateDiv = document.getElementById("waiting-for-start-state");
const nameSelectionStateDiv = document.getElementById("name-selection-state");
const playerCountText = document.getElementById("player-count-text");


const socket = new WebSocket("ws://localhost:4040");
let sessionToken = null;
let lastPlayerCountPacket = null;
let currentState = null;
let currentStateLoopIntervalID = null;

const globalPacketTypes =
[
    "SESSION_START",
];

const globalPacketHandlers = {};

globalPacketHandlers["SESSION_START"] = (packet) =>
{ 
    sessionToken = packet.session_token;

    //debug mode state selection
    if (packet.debug)
    {
        if (packet.debug.state === "NAME_SELECTION_STATE")
            setState(new NameSelectionState(packet.debug.client_params));
        else if (packet.debug.state === "NAMES_SELECTED_STATE")
            setState(new NamesSelectedState(packet.debug.client_params));
    }
    else
        setState(new StartState());
};

socket.addEventListener("error", (error) =>
{
    console.log("Connection failed");
    console.log(error);

    const message =
    {
        errorMessage: "An error occurred."
    };

    setState(new DisconnectedState(message));
});

socket.addEventListener("close", (event) =>
{
    console.log(`Connection closed with code ${event.code}`);

    const message =
    {
        errorMessage: "An error occurred"
    }

    setState(new DisconnectedState(message));
});

socket.addEventListener("open", (event) =>
{

});

socket.addEventListener("message", (message) =>
{
    const packet = JSON.parse(message.data);

    console.log("Received packet %o", packet);

    let packetHandler = globalPacketHandlers[packet.type];

    if (packetHandler)
        packetHandler(packet);
    else
        currentState.onMessage(packet);
});


function sendPacket(packet)
{
    packet["session_token"] = sessionToken;

    socket.send(JSON.stringify(packet));
}

//runs loop of internal state, but also runs hooks
function _setState(newState)
{
    //this function runs right after the previous loop exit
    if (currentState)
    {
        currentState.onExit();

        currentState.element.classList.remove("state-container-active");
    }

    currentState = newState;

    if (!(currentState.loop && currentState.loopInterval))
        throw new Error(`Loop function or interval undefined for state ${currentState.name}`);

    currentState.element.classList.add("state-container-active");

    let boundLoop = currentState.loop.bind(currentState);

    currentStateIntervalID = setInterval(boundLoop, currentState.loopInterval);

    currentState.onEnter();
}

function setState(newState)
{
    //now we need to transition over to the next state, but before we do
    //we want to make sure the current state is no longer running
    //for example, the state's loop might have called setState, and will
    //actually still be running once this method exits
    //to avoid this, we add the actual state change code to run right after
    //the call stack unwinds

    //but we can still cancel the interval now, in case it somehow gets ahead
    //in the queue again
    if (currentState)
        clearInterval(currentStateLoopIntervalID);

    setTimeout(() => _setState(newState), 0);
}