class css_injector {
    constructor() {
        console.log("Injector Online");
    }

    private Inject(css : string): void{
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
        console.log("Injected:\n" + css);
    }
}

const Injector = new css_injector();
export default Injector;