const State = require("./state.js");
const NameSelectionState = require("./name-selection-state.js");
const config = require("./config.json");
const Timer = require("./timer.js");

class StartState extends State
{
    constructor()
    {
        super();

        this.name = "WAITING_FOR_PLAYERS";
        this.loopInterval = 500;
        this.lastPlayerCount = 0;
        this.timer = new Timer();
        this.seconds = null;
    }

    _startGame()
    {
        const changeStatePacket =
        {
            type: "CHANGE_STATE",
            new_state: "NAME_SELECTION_STATE",
            params:
            {
                seconds_until_start: config.name_selection_duration
            }
        };
        
        this.room.broadcast(changeStatePacket);

        this.room.setState(new NameSelectionState());
    }

    onSessionDisconnect(session)
    {
        console.log("session disconnected");
    }

    onSessionMessage(session, message)
    {
        //this message is actually internal and not from
        //the remote client
        if (message.type === "NEW_SESSION")
        {
            //session just joined, let it know room parameters
            const roomParametersPacket =
            {
                type: "ROOM_PARAMETERS",
                min_players: config.room_min_players,
                max_players: config.room_max_players,
                current_players: this.room.sessions.length,
                seconds_until_start: config.room_player_wait_duration //reset wait duration because a new player joined
            };

            session.sendPacket(roomParametersPacket);

            this.timer.restart();

            this.seconds = config.room_player_wait_duration;
        }
    }

    onExit()
    {

    }

    loop()
    {
        if (this.room.sessions.length === config.room_max_players)
        {
            //we have enough players, start the game
            this._startGame();
        }
        else
        {
            //if a player joined or left, send out the new number
            if (this.lastPlayerCount != this.room.sessions.length)
            {
                this.lastPlayerCount = this.room.sessions.length;

                const playerCountPacket =
                {
                    type: "ROOM_PLAYER_COUNT",
                    current_players: this.room.sessions.length
                };

                this.room.broadcast(playerCountPacket);
            }
            else
            {
                if (this.room.sessions.length >= config.room_min_players)
                {
                    //we have enough people for a game, so the game can start if nobody else joins after a while
                    //track how long it has been

                    this.seconds -= this.timer.elapsedSeconds();

                    this.timer.restart();

                    if (this.seconds <= 0)
                    {
                        //we have more than the minimum players and the timer has elapsed, start the game
                        this._startGame();
                    }
                }
            }
        }
    }
}

module.exports = StartState;