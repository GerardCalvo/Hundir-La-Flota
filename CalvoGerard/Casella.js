export class Casella {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ocupada = false;
        this.impactada = false;
        this.vaixellEnfonsat = false;
        this.nomVaixell = "";
        this.estat = "buida";
    }
}
    