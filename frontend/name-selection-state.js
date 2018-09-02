NameSelectionState = (() => {
    
    class NameSelectionState extends State
    {
        constructor(params)
        {
            super();

            this.name = "NAME_SELECTION_STATE";
            this.loopInterval = 500;
            this.element = document.getElementById("name-selection-state");
            this.seconds = params.seconds_until_start;
            this.timer = new Timer();
            this.textElement = document.getElementById("name-selection-seconds-left-text");
            this.inputElement = document.getElementById("name-input");
            this.sentName = false;
        }

        onMessage(message)
        {

        }
    
        onExit()
        {

        }

        loop()
        {
            this.seconds -= this.timer.elapsedSeconds();

            if (this.seconds < 0)
            {
                this.seconds = 0;

                if (!this.sentName)
                {
                    this.sentName = true;

                    const name = this.inputElement.value;

                    this.inputElement.disabled = true;

                    const namePacket =
                    {
                        type: "NAME_SELECTION",
                        name: name
                    };

                    sendPacket(namePacket);
                }
            }

            this.timer.restart();

            this.textElement.innerHTML = `Starting in ${Math.ceil(this.seconds)} seconds`;
        }
    }
    
    return NameSelectionState;
    
})();