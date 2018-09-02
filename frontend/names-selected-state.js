NamesSelectedState = (() => {
    
    class NamesSelectedState extends State
    {
        constructor(params)
        {
            super();

            this.name = "NAMES_SELECTED_STATE";
            this.loopInterval = 500;
            this.element = document.getElementById("names-selected-state");
        }

        onMessage(message)
        {

        }
    
        onExit()
        {

        }

        loop()
        {

        }
    }
    
    return NamesSelectedState;
    
})();