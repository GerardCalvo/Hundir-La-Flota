import { Taulell } from "./Taulell.js";

let jsonVaixells = `[
    { "nom": "Portaavions", "mida": 5 },
    { "nom": "Cuirassat", "mida": 4 },
    { "nom": "Creuer", "mida": 3 },
    { "nom": "Submarí", "mida": 3 },
    { "nom": "Destructor", "mida": 2 }
]`;

// Variables globals
let vaixellSeleccionat = null;
let orientacioVaixell = 'V';
let modeJoc = "colocacio";
let tornJugador = true;
let jocAcabat = false;

let llistaVaixells = JSON.parse(jsonVaixells);

// taulell JUGADOR
let taulell = new Taulell(10);
taulell.guardarVaixells(llistaVaixells);

let contenidorJugador = document.getElementById('taulell1');
mostrartaulellHTML(taulell, contenidorJugador);

let contenidorVaixells = document.getElementById('vaixells');
for (let vaixell of llistaVaixells) {
    let boto = document.createElement('button');
    boto.id = vaixell.nom.toLowerCase();
    boto.textContent = `${vaixell.nom} - ${vaixell.mida}`;
    boto.addEventListener("click", function () {
        vaixellSeleccionat = vaixell;
        boto.disabled = true;
    });

    contenidorVaixells.appendChild(boto);
}

// Canvi de direcció vaixell amb la tecla 'D'.
document.addEventListener("keypress", function (event) {
    if (event.key === "D" || event.key === "d") {
        orientacioVaixell = (orientacioVaixell === 'V') ? 'H' : 'V';
    }
});

// taulell IA
let contenidorIA = document.getElementById('taulell2');
let taulellIA = new Taulell(10);

taulellIA.guardarVaixells(llistaVaixells);
taulellIA.posicionarVaixellsAleatori();

mostrartaulellHTML(taulellIA, contenidorIA, false);

function atacIA() {
    let disparIA = taulell.generarAtacIA();
    mostrartaulellHTML(taulell, contenidorJugador);
    
    // Comprovar si la IA ha guanyat
    if (taulell.comprovarEstatPartida()) {
        finalitzarJoc("IA");
    }
    
    return disparIA;
}

window.atacIA = atacIA;

function finalitzarJoc(guanyador) {
    jocAcabat = true;
    modeJoc = "acabat";
    
    document.getElementById('taulell1').classList.add('taulell-desactivat');
    document.getElementById('taulell2').classList.add('taulell-desactivat');
    
    const indicador = document.getElementById('indicador-torn');
    indicador.classList.add('missatge-final');
    
    if (guanyador === "Jugador") {
        indicador.textContent = "🎉 Has guanyat! Felicitats! 🎉";
        indicador.classList.add('victoria');
    } else if (guanyador === "IA") {
        indicador.textContent = "😔 Has perdut! La IA ha guanyat! 😔";
        indicador.classList.add('derrota');
    }
    
    setTimeout(() => {
        const botoReiniciar = document.createElement('button');
        botoReiniciar.textContent = "Nova Partida";
        botoReiniciar.classList.add('boto-reiniciar');
        botoReiniciar.addEventListener('click', () => {
            location.reload();
        });
        
        const contenidorBotons = document.getElementById('botons');
        contenidorBotons.classList.add('joc-acabat');
        contenidorBotons.appendChild(botoReiniciar);
    }, 1000);
}

function mostrartaulellHTML(taulell, contenidor, esJugador = true) {
    contenidor.innerHTML = '';

    for (let i = 0; i < taulell.mida; i++) {
        for (let j = 0; j < taulell.mida; j++) {
            let casella = taulell.caselles[i][j];
            let classe = (esJugador && casella.ocupada) ? 'ocupada' : 'buida';
            let casellaDiv = document.createElement('div');
            casellaDiv.classList.add('casella', classe);
            casellaDiv.classList.add('casella', casella.estat);

            if (esJugador && modeJoc === "colocacio") {
                casellaDiv.addEventListener("click", function (event) {
                    if (vaixellSeleccionat === null) {
                        alert("No has seleccionat cap vaixell");
                    } else {
                        let posicionat = taulell.posicionarVaixell(orientacioVaixell, i, j, vaixellSeleccionat);
                        if (!posicionat) {
                            let boto = document.getElementById(vaixellSeleccionat.nom.toLowerCase());
                            boto.disabled = false;
                        }
                        vaixellSeleccionat = null;
                        if (taulell.totsElsVaixellsColocats()) {
                            modeJoc = "atac";
                            mostrartaulellHTML(taulellIA, contenidorIA, false);
                        }
                        mostrartaulellHTML(taulell, contenidor);
                    }
                });
            }

            if (!esJugador && modeJoc === "atac" && !jocAcabat) {
                casellaDiv.addEventListener("click", function (event) {
                    if (!tornJugador) return;
                    let disparJugador = taulellIA.rebreTir(i, j);
                    mostrartaulellHTML(taulellIA, contenidorIA, false);
                    
                    // Comprovar si el jugador ha guanyat
                    if (taulellIA.comprovarEstatPartida()) {
                        finalitzarJoc("Jugador");
                        return;
                    }
                    
                    if (disparJugador === "aigua") {
                        tornJugador = false;
                        actualitzarIndicadorTorn();
                        function ferDisparIA() {
                            setTimeout(() => {
                                if (jocAcabat) return; // Evitar que la IA continuï si el joc ja ha acabat
                                let resultat = atacIA();
                                if (resultat === "tocat" || resultat === "enfonsat") {
                                    if (!jocAcabat) { // Només continuar si el joc no ha acabat
                                        ferDisparIA();
                                    }
                                } else {
                                    tornJugador = true;
                                    actualitzarIndicadorTorn();
                                }
                            }, 1000);
                        }
                        ferDisparIA();
                    }
                });
            }

            if (esJugador || (!esJugador && casella.vaixellEnfonsat)) {
                if (casella.nomVaixell) {
                    casellaDiv.textContent = casella.nomVaixell[0];
                }
            }

            contenidor.appendChild(casellaDiv);
        }
    }
}

function actualitzarIndicadorTorn() {
    if (jocAcabat) return; // No actualitzar si el joc ha acabat
    
    const indicador = document.getElementById('indicador-torn');
    indicador.textContent = `Torn: ${tornJugador ? 'Jugador' : 'IA'}`;
}

// ------------------- API ---------------------

async function desarPartida(nomJugador, taulellJugador, taulellIA) {
    const partida = {
        jugador: nomJugador,
        tableroJugador: JSON.stringify(taulellJugador),
        tableroIA: JSON.stringify(taulellIA)
    };

    try {
        const response = await fetch("http://localhost:3000/partidas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(partida)
        });

        if (!response.ok) throw new Error("Error al guardar la partida");

        const data = await response.json();
        console.log("Partida guardada:", data);
        return data.id; // ID de la partida
    } catch (err) {
        console.error("Error:", err);
    }
}

async function cargarPartida(idPartida) {
    try {
        const response = await fetch(`http://localhost:3000/partidas/${idPartida}`);
        if (!response.ok) throw new Error("No s'ha trobat la partida");

        const data = await response.json();
        console.log("Partida carregada:", data);
        return data;
    } catch (err) {
        console.error("Error:", err);
    }
}

document.getElementById("desar").addEventListener("click", () => {
    const nomJugador = prompt("Introdueix el teu nom:");
    desarPartida(nomJugador, taulell, taulellIA);
});

document.getElementById("carregar").addEventListener("click", async () => {
    const id = prompt("Introdueix l'ID de la partida:");
    const partida = await cargarPartida(id);
    recuperartaulellsDeAPI(partida);
});

function recuperartaulellsDeAPI(partida) {
    let dadestaulellJugador = JSON.parse(partida.tableroJugador);
    let dadestaulellIA = JSON.parse(partida.tableroIA);

    let taulell = new Taulell(10);
    taulell.mida = dadestaulellJugador.mida;
    taulell.caselles = dadestaulellJugador.caselles;
    taulell.vaixells = dadestaulellJugador.vaixells;
    mostrartaulellHTML(taulell, document.getElementById('taulell1'));

    let taulellIA = new Taulell(10);
    taulellIA.mida = dadestaulellIA.mida;
    taulellIA.caselles = dadestaulellIA.caselles;
    taulellIA.vaixells = dadestaulellIA.vaixells;
    mostrartaulellHTML(taulellIA, document.getElementById('taulell2'), false);
}