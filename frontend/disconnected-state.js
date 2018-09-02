DisconnectedState = (() => {
    
    class DisconnectedState extends State
    {
        constructor(params)
        {
            super();

            this.name = "DISCONNECTED_STATE";
            this.loopInterval = 500;
            this.element = document.getElementById("disconnected-state");
            this.text = document.getElementById("disconnected-message-text");

            this.params = params;
        }

        onMessage(message)
        {

        }

        onEnter()
        {
            this.text.innerHTML = this.params.errorMessage;

            const reloadButton = document.getElementById("disconnected-button");

            reloadButton.addEventListener("click", () =>
            {
                location.reload(true);
            });
        }
    
        onExit()
        {

        }

        loop()
        {

        }
    }
    
    return DisconnectedState;
    
})();