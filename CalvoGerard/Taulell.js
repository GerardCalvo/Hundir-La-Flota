import { Casella } from "./Casella.js";
import { Vaixell } from "./Vaixell.js";

export class Taulell {
    mida;
    caselles;
    vaixells;

    constructor(mida) {
        this.mida = mida;
        this.caselles = [];
        this.vaixells = [];
        this.crearTaulell();
    }

    crearTaulell() {
        for (let i = 0; i < this.mida; i++) {
            this.caselles[i] = [];
            for (let j = 0; j < this.mida; j++) {
                this.caselles[i][j] = new Casella(i, j);
            }
        }
    }

    guardarVaixells(llistaVaixells) {
        this.vaixells = llistaVaixells.map(vaixell => new Vaixell(vaixell.nom, vaixell.mida))
    }

    posicionarVaixellsAleatori() {
        for (let vaixell of this.vaixells) {
            let vaixellColocat = false;

            while (!vaixellColocat) {
                let orientacio = Math.random() < 0.5 ? "H" : "V";
                let fila = this.numeroAleatori(0, this.mida - 1);
                let columna = this.numeroAleatori(0, this.mida - 1);

                let espai = this.verificarEspai(vaixell, orientacio, fila, columna);

                if (espai) {
                    this.colocarVaixell(vaixell, orientacio, fila, columna);
                    vaixellColocat = true;
                }
            }
        }
    }

    posicionarVaixell(orientacio, fila, columna, vaixellSelec) {
        let vaixell;
        for (let v of this.vaixells) {
            if(v.nom == vaixellSelec.nom) {
                vaixell = v;
            }
        }
        let vaixellColocat = false;

        let espai = this.verificarEspai(vaixell, orientacio, fila, columna);

        if (espai) {
            this.colocarVaixell(vaixell, orientacio, fila, columna);
            vaixellColocat = true;
        } else {
            vaixellColocat = false;
        }
    
        return vaixellColocat;
    }

    totsElsVaixellsColocats() {
        let totalVaixells = this.vaixells.length;
        let vaixellsColocats = 0;
        for (let vaixell of this.vaixells) {
            if(vaixell.colocat) vaixellsColocats++;
        }
        return vaixellsColocats === totalVaixells;
    }

    verificarEspai(vaixell, orientacio, fila, columna) {
        const esPortaavions = vaixell.nom === "Portaavions";

        const comprovarZona = (x, y) => {
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let nx = x + dx;
                    let ny = y + dy;
                    if (nx >= 0 && ny >= 0 && nx < this.mida && ny < this.mida) {
                        if (this.caselles[nx][ny].ocupada) {
                            return false;
                        }
                    }
                }
            }
            return true;
        };

        if (orientacio === "H") {
            if (columna + vaixell.mida > this.mida || (esPortaavions && fila + 1 >= this.mida)) {
                return false;
            }

            for (let i = 0; i < vaixell.mida; i++) {
                if (!comprovarZona(fila, columna + i)) return false;
            }

        } else if (orientacio === "V") {
            if (fila + vaixell.mida > this.mida || (esPortaavions && columna + 1 >= this.mida)) {
                return false;
            }

            for (let j = 0; j < vaixell.mida; j++) {
                if (!comprovarZona(fila + j, columna)) return false;
            }
        }

        return true;
    }

    // Col·loca el vaixell a la posició indicada
    colocarVaixell(vaixell, orientacio, fila, columna) {
        let esPortaavions = vaixell.nom === "Portaavions";
        if(orientacio === "H") {
            for (let i = 0; i < vaixell.mida; i++) {
                this.caselles[fila][columna + i].ocupada = true;
                this.caselles[fila][columna + i].estat = "ocupada";
                this.caselles[fila][columna + i].nomVaixell = vaixell.nom;
                vaixell.posicions.push({x: fila, y: columna + i});
                vaixell.colocat = true;
                vaixell.orientacio = "H";
            }
        } else  {
            for (let j = 0; j < vaixell.mida; j++) {
                this.caselles[fila + j][columna].ocupada = true;
                this.caselles[fila + j][columna].estat = "ocupada";
                this.caselles[fila + j][columna].nomVaixell = vaixell.nom;
                vaixell.posicions.push({x: fila + j, y: columna});
                vaixell.colocat = true;
                vaixell.orientacio = "V";
            }
        }
    }

    numeroAleatori(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    rebreTir(fila, columna) {
        let resultat = "aigua"; // Per defecte
    
        if ((fila <= 9 && fila >= 0) && (columna <= 9 && columna >= 0)) {
            const cel·la = this.caselles[fila][columna];
    
            if (cel·la.estat === "aigua" || cel·la.estat === "tocat" || cel·la.estat === "enfonsat") {
                return "repetit"; // Ja ha tirat aquí
            }
    
            if (cel·la.ocupada) {
                cel·la.impactada = true;
                cel·la.estat = "tocat";
                resultat = "tocat";
    
                for (let vaixell of this.vaixells) {
                    if (vaixell.nom === cel·la.nomVaixell) {
                        let tocats = 0;
                        let totalPosicions = vaixell.posicions.length;

                        for (let pos of vaixell.posicions) {
                            if (this.caselles[pos.x][pos.y].impactada) {
                                tocats++;
                            }
                        }
    
                        // Si totes les caselles estan tocades, el vaixell està enfonsat
                        if (tocats === totalPosicions) {
                            resultat = "enfonsat";
                            vaixell.enfonsat = true;
    
                            for (let pos of vaixell.posicions) {
                                const c = this.caselles[pos.x][pos.y];
                                c.vaixellEnfonsat = true;
                                c.estat = "enfonsat";
                            }
                        }
                    }
                }
            } else {
                cel·la.estat = "aigua";
            }
        }
    
        return resultat;
    }

    // Comprova si ja s'han enfonsat tots els vaixells d'aquest taulell
    comprovarEstatPartida() {
        let numVaixells = this.vaixells.length;
        let vaixellsEnfonsats = 0;
        for (let vaixell of this.vaixells) {
            if (vaixell.enfonsat == true) {
                vaixellsEnfonsats++;
            }
        }
        
        // Si tots els vaixells estan enfonsats, retorna true
        return vaixellsEnfonsats === numVaixells;
    }

    generarAtacIA() {
        // 1. Buscar si hi ha un "tocat" no enfonsat i disparar a prop
        for (let i = 0; i < this.mida; i++) {
            for (let j = 0; j < this.mida; j++) {
                const cel·la = this.caselles[i][j];
                if (cel·la.estat == "tocat" && !cel·la.vaixellEnfonsat) {
                    const adjacents = this.obtenirAdjacents({ x: i, y: j });
                    for (let adj of adjacents) {
                        const res = this.rebreTir(adj.x, adj.y);
                        if (res !== "repetit") {
                            return res; // Retorna el resultat del tir
                        }
                    }
                }
            }
        }
        // 2. Si no hi ha tocats, fer tir aleatori únic
        let x, y, res;
        do {
            x = Math.floor(Math.random() * this.mida);
            y = Math.floor(Math.random() * this.mida);
            res = this.rebreTir(x, y);
        } while (res === "repetit"); // Només repeteix si ja ha tirat aquí

        // Fi del torn encara que sigui aigua
        return res;
    }

    obtenirAdjacents(pos) {
        const adj = [
            { x: pos.x + 1, y: pos.y },
            { x: pos.x - 1, y: pos.y },
            { x: pos.x, y: pos.y + 1 },
            { x: pos.x, y: pos.y - 1 },
        ];
        let disponibles = [];

        for (let i = 0; i < adj.length; i++) {
            let p = adj[i];

            if (this.enRang(p.x, p.y)) {
                let estat = this.caselles[p.x][p.y].estat;
                if (estat !== "aigua" && estat !== "tocat" && estat !== "enfonsat") {
                    disponibles.push(p);
                }
            }
        }

        return disponibles;
    }

    enRang(x, y) {
        return x >= 0 && x < this.mida && y >= 0 && y < this.mida;
    }

    exportarDades() {
    return {
        mida: this.mida,
        caselles: this.caselles.map(fila => fila.map(casella => ({
            ocupada: casella.ocupada,
            estat: casella.estat,
            nomVaixell: casella.nomVaixell,
            impactada: casella.impactada,
            vaixellEnfonsat: casella.vaixellEnfonsat
        }))),
        vaixells: this.vaixells.map(v => ({
            nom: v.nom,
            mida: v.mida,
            posicions: v.posicions,
            colocat: v.colocat,
            enfonsat: v.enfonsat,
            orientacio: v.orientacio
        }))
    };
}

}
