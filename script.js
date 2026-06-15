const patrullas = [

    "ADAM 10",
    "ADAM 20",
    "ADAM 30",
    "ADAM 40",

    "ADAM 50",
    "ADAM 60",
    "ADAM 70",
    "ADAM 80",

    "MERIT 01",
    "MERIT 02",
    "MERIT 03",
    "MERIT 04",
    "MERIT 05",

];

/* ========================= */
/* RELOJ */
/* ========================= */

function actualizarReloj(){

    const reloj = document.getElementById("reloj");

    if(reloj){

        reloj.innerText = new Date().toLocaleString("es-CL", {
            hour12: false
        });

    }

}

setInterval(actualizarReloj,1000);
actualizarReloj();

/* ========================= */
/* PESTAÑAS */
/* ========================= */

function mostrarPestana(id){

    document
        .querySelectorAll(".tab-content")
        .forEach(tab => tab.classList.remove("active"));

    document
        .querySelectorAll(".tab-btn")
        .forEach(btn => btn.classList.remove("active"));

    document
        .getElementById(id)
        .classList.add("active");

if(id === "operaciones"){
document.querySelectorAll(".tab-btn")[0].classList.add("active");
}

if(id === "comunicaciones"){
document.querySelectorAll(".tab-btn")[1].classList.add("active");
}

if(id === "manual"){
document.querySelectorAll(".tab-btn")[2].classList.add("active");
}


}

/* ========================= */
/* ACORDEON */
/* ========================= */

document.addEventListener("DOMContentLoaded", () => {

    const botones =
        document.querySelectorAll(".acordeon-btn");

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            const contenido =
                boton.nextElementSibling;

            if(contenido.style.display === "block"){

                contenido.style.display = "none";

            }else{

                contenido.style.display = "block";

            }

        });

    });

});

/* ========================= */
/* ESTADO UNIDADES */
/* ========================= */

function cambiarEstado(nombre){

    const estadoActual =
        localStorage.getItem(nombre + "_estado") === "true";

    localStorage.setItem(
        nombre + "_estado",
        !estadoActual
    );

    renderizarPatrullas();

}

function guardarDotacion(nombre,cantidad){

    localStorage.setItem(
        nombre + "_dotacion",
        cantidad
    );

    renderizarPatrullas();

}

/* ========================= */
/* RENDERIZAR */
/* ========================= */

function renderizarPatrullas(){

    const contenedor =
        document.getElementById("listaPatrullas");

    contenedor.innerHTML = "";

    let disponibles = 0;
    let oficialesDisponibles = 0;

    const adam =
        patrullas.filter(p => p.includes("ADAM"));

    const merit =
        patrullas.filter(p => p.includes("MERIT"));

    function crearGrupo(titulo,lista){

        let html = `
            <div class="titulo-grupo">${titulo}</div>
            <div class="grupo-unidades">
        `;

        lista.forEach(nombre => {

            const estado =
                localStorage.getItem(nombre + "_estado") === "true";

            const dotacion =
                parseInt(
                    localStorage.getItem(nombre + "_dotacion")
                ) || 0;

            if(estado){

                disponibles++;
                oficialesDisponibles += dotacion;

            }

            html += `
                <div class="lista-unidad ${estado ? "disponible" : "nodisponible"}">

                    <div
                        class="nombre-unidad"
                        onclick="cambiarEstado('${nombre}')">

                        ${estado ? "🟢" : "🔴"}
                        ${nombre}

                    </div>

                    <div class="dotacion">

                        <button
                            class="${dotacion===0 ? "activo" : ""}"
                            onclick="guardarDotacion('${nombre}',0)">
                            0
                        </button>

                        <button
                            class="${dotacion===1 ? "activo" : ""}"
                            onclick="guardarDotacion('${nombre}',1)">
                            1
                        </button>

                        <button
                            class="${dotacion===2 ? "activo" : ""}"
                            onclick="guardarDotacion('${nombre}',2)">
                            2
                        </button>

                        <button
                            class="${dotacion===3 ? "activo" : ""}"
                            onclick="guardarDotacion('${nombre}',3)">
                            3
                        </button>

                    </div>

                </div>
            `;

        });

        html += `</div>`;

        return html;

    }

    contenedor.innerHTML +=
        crearGrupo("ADAM",adam);

    contenedor.innerHTML +=
        crearGrupo("MERIT",merit);

    document.getElementById("disponibles").innerText =
        disponibles;

    document.getElementById("nodisponibles").innerText =
        patrullas.length - disponibles;

    document.getElementById("oficialesDisponibles").innerText =
        oficialesDisponibles;

}

renderizarPatrullas();

/* ========================= */
/* REINICIAR */
/* ========================= */

function reiniciarUnidades(){

    const confirmar =
        confirm("¿Deseas reiniciar todas las unidades?");

    if(!confirmar) return;

    patrullas.forEach(nombre => {

        localStorage.setItem(
            nombre + "_estado",
            false
        );

        localStorage.setItem(
            nombre + "_dotacion",
            0
        );

    });

    renderizarPatrullas();

}

/* ========================= */
/* NOTAS */
/* ========================= */

const notas =
    document.getElementById("notas");

if(notas){

    notas.value =
        localStorage.getItem("notas") || "";

    notas.addEventListener("input", () => {

        localStorage.setItem(
            "notas",
            notas.value
        );

    });

}

/* ========================= */
/* TAC */
/* ========================= */

["tac1","tac2","tac3","tac4","tac5"]
.forEach(id => {

    const campo =
        document.getElementById(id);

    if(!campo) return;

    campo.value =
        localStorage.getItem(id) || "";

    campo.addEventListener("input", () => {

        localStorage.setItem(
            id,
            campo.value
        );

    });

});
function copiarMensaje(texto){

    navigator.clipboard.writeText(texto)
    .then(() => {
        alert("Mensaje copiado al portapapeles");
    })
    .catch(error => {
        console.error(error);
        alert("Error al copiar");
    });

}

function generar488(){

    const lugar = document.getElementById("roboLugar").value;
    const vehiculo = document.getElementById("roboVehiculo").value;
    const color = document.getElementById("roboColor").value;
    const patente = document.getElementById("roboPatente").value;
    const atracadores = document.getElementById("roboAtracadores").value;
    const vestimenta = document.getElementById("roboVestimenta").value;
    const armas = document.getElementById("roboArmas").value;

    const mensaje =
`/r 10-97 al 488 del lugar ${lugar} | V: ${vehiculo} C: ${color} Matricula: ${patente} COD-37 | Atracadores: ${atracadores} Vestimenta: ${vestimenta} Portan: ${armas}`;

    mostrarVistaPrevia(mensaje);

}

function generarPatrullaje(){

    const unidad = document.getElementById("patUnidad").value;
    const oficial1 = document.getElementById("patOficial1").value;
    const oficial2 = document.getElementById("patOficial2").value;
    const ubicacion = document.getElementById("patUbicacion").value;

    const mensaje =
        `/r ${unidad} conformado por ${oficial1} y ${oficial2}, inician 10-33 desde ${ubicacion}, Good Service.`;

    document.getElementById("vistaPrevia").value = mensaje;
}

function generarSAMS(){

    const estado = document.getElementById("estadoPaciente").value;

    const mensaje =
`/rff Solicitamos un Alfa en nuestro 10-20 para tratar a un sujeto/agente en estado ${estado}`;

    mostrarVistaPrevia(mensaje);

}
function mostrarVistaPrevia(texto){

    document.getElementById("vistaPrevia").value = texto;

}

function copiarVistaPrevia(){

    const texto =
        document.getElementById("vistaPrevia").value;

    if(!texto){
        alert("No hay mensaje para copiar");
        return;
    }

    navigator.clipboard.writeText(texto)
    .then(() => {
        alert("Mensaje copiado");
    });

}
function generarIncautados(){

    const nombre =
        document.getElementById("incautadoNombre").value;

    const objetos =
        document.getElementById("incautadoObjetos").value;

    const mensaje =
        `/r "${nombre}" | ${objetos} | Procesado por: Tobias Bismarck`;

    copiarMensaje(mensaje);

}
function generarCodigo4(){

    const codigo =
        document.getElementById("codigoEvento").value;

    copiarMensaje(
        `/r 10-97 del ${codigo} | Cod.4`
    );

}

function generarSinExito(){

    const codigo =
        document.getElementById("codigoEvento").value;

    copiarMensaje(
        `/r 10-98 al último ${codigo}, sin éxito | Procedemos con 10-22`
    );

}

function generarRetomar(){

    const codigo =
        document.getElementById("codigoEvento").value;

    copiarMensaje(
        `/r 10-98 del último ${codigo} | Retomamos 10-33`
    );

}
function generarNegociacion(){

    const tipo =
        document.getElementById("tipoNegociacion").value;

    const lugar =
        document.getElementById("lugarNegociacion").value;

    const detalle =
        document.getElementById("detalleNegociacion").value;

    const hora =
        new Date().toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });

    let mensaje = "";

    const textoTipo =
        tipo === "termino"
            ? "término"
            : "corte";

    if(
        lugar === "24/7" ||
        lugar === "LTD" ||
        lugar === "Ammu-Nation" ||
        lugar === "Robo a Casa"
    ){

        mensaje =
            `/lspd Se informa el ${textoTipo} de negociaciones en ${lugar} de ${detalle} a las ${hora}`;

    }else{

        mensaje =
            `/lspd Se informa el ${textoTipo} de negociaciones en ${lugar} a las ${hora}`;

    }

    mostrarVistaPrevia(mensaje);

}
