StartState = (() => {
    
    class StartState extends State
    {
        constructor()
        {
            super();

            this.name = "START_STATE";
            this.loopInterval = 500;
            this.element = document.getElementById("start-state");
            this.text = document.getElementById("player-count-text");
            this.roomParameters = null;
            this.seconds = null;
            this.playerCount = null;
            this.timer = new Timer();
        }

        onMessage(message)
        {
            if (message.type === "ROOM_PARAMETERS")
            {
                this.roomParameters = message;
            }

            if (message.type === "ROOM_PLAYER_COUNT")
            {
                this.seconds = this.roomParameters.seconds_until_start;
                this.playerCount = message.current_players;

                this.timer.restart();
            }

            if (message.type === "CHANGE_STATE")
                setState(new NameSelectionState(message.params));
        }
    
        onExit()
        {
            console.log("exiting start state");
        }

        loop()
        {
            if (this.roomParameters)
            {
                this.seconds -= this.timer.elapsedSeconds();

                if (this.seconds < 0)
                    this.seconds = 0;

                this.timer.restart();

                this.updatePlayerCountText();
            }
        }

        updatePlayerCountText()
        {
            if (!(this.roomParameters && this.playerCount !== null))
                return;

            let players = this.playerCount;
            let min = this.roomParameters.min_players;
            let max = this.roomParameters.max_players;
            let seconds = Math.ceil(this.seconds);

            let message = null;

            if (players >= min)
                message = `${players}/${max}, starting in ${seconds} seconds`;
            else
                message = `${players}/${max}, need ${min - players} more players to start.`;

            this.text.innerHTML = message;
        }
    }
    
    return StartState;
    
})();