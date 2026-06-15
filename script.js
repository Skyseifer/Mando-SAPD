const patrullas = [
    "ADAM 10", "ADAM 20", "ADAM 30", "ADAM 40",
    "ADAM 50", "ADAM 60", "ADAM 70", "ADAM 80",
    "LINCOLN 10", "LINCOLN 20", "LINCOLN 30", "LINCOLN 40",
    "LINCOLN 50", "LINCOLN 60", "LINCOLN 70", "LINCOLN 80",
    "MERIT 01", "MERIT 02", "MERIT 03", "MERIT 04", "MERIT 05"
];

/* ========================================= */
/* RELOJ (Formato Local de 24 Horas) */
/* ========================================= */
function actualizarReloj(){
    const reloj = document.getElementById("reloj");
    if(reloj){
        reloj.innerText = new Date().toLocaleString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

/* ========================================= */
/* PESTAÑAS (TABS) */
/* ========================================= */
function mostrarPestana(id){
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));

    const tabObjetivo = document.getElementById(id);
    if(tabObjetivo) tabObjetivo.classList.add("active");

    const botones = document.querySelectorAll(".tab-btn");
    if(botones.length >= 3) {
        if(id === "operaciones") botones[0].classList.add("active");
        if(id === "comunicaciones") botones[1].classList.add("active");
        if(id === "manual") botones[2].classList.add("active");
    }
}

/* ========================================= */
/* ACORDEÓN (MANUAL OPERATIVO) */
/* ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    actualizarReloj();
    renderizarPatrullas();
    toggleDetalleNegociacion();

    const botones = document.querySelectorAll(".acordeon-btn");
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const contenido = boton.nextElementSibling;
            if(contenido.style.display === "block"){
                contenido.style.display = "none";
            } else {
                contenido.style.display = "block";
            }
        });
    });
});

/* ========================================= */
/* ESTADO DE UNIDADES & LOCALSTORAGE */
/* ========================================= */
function cambiarEstado(nombre){
    const estadoActual = localStorage.getItem(nombre + "_estado") === "true";
    localStorage.setItem(nombre + "_estado", !estadoActual);
    renderizarPatrullas();
}

function guardarDotacion(nombre, cantidad){
    localStorage.setItem(nombre + "_dotacion", cantidad);
    renderizarPatrullas();
}

/* ========================================= */
/* RENDERIZADOR ADAPTADO A TU NUEVO CSS */
/* ========================================= */
function renderizarPatrullas(){
    const contenedor = document.getElementById("listaPatrullas");
    if(!contenedor) return;
    
    contenedor.innerHTML = "";

    let disponibles = 0;
    let oficialesDisponibles = 0;

    const adam = patrullas.filter(p => p.includes("ADAM"));
    const lincoln = patrullas.filter(p => p.includes("LINCOLN"));
    const merit = patrullas.filter(p => p.includes("MERIT"));

    function crearGrupo(titulo, lista){
        if(lista.length === 0) return "";
        
        let html = `
            <div class="titulo-grupo">${titulo}</div>
            <div class="grupo-unidades">
        `;

        lista.forEach(nombre => {
            const estado = localStorage.getItem(nombre + "_estado") === "true";
            const dotacion = parseInt(localStorage.getItem(nombre + "_dotacion")) || 0;

            if(estado){
                disponibles++;
                oficialesDisponibles += dotacion;
            }

            html += `
                <div class="lista-unidad ${estado ? "disponible" : "nodisponible"}">
                    <div class="nombre-unidad" onclick="cambiarEstado('${nombre}')">
                        ${estado ? "🟢" : "🔴"} ${nombre}
                    </div>
                    <div class="dotacion">
                        ${[0, 1, 2, 3].map(num => `
                            <button class="${dotacion === num ? "activo" : ""}" 
                                    onclick="guardarDotacion('${nombre}', ${num})">
                                ${num}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    // Renderiza usando las clases puras de tu CSS (Grid automático de 4 columnas)
    contenedor.innerHTML += crearGrupo("UNIDADES ADAM", adam);
    contenedor.innerHTML += crearGrupo("UNIDADES LINCOLN", lincoln);
    contenedor.innerHTML += crearGrupo("UNIDADES MERIT", merit);

    // Actualización de marcadores superiores numéricos
    document.getElementById("disponibles").innerText = disponibles;
    document.getElementById("nodisponibles").innerText = patrullas.length - disponibles;
    document.getElementById("oficialesDisponibles").innerText = oficialesDisponibles;
}

/* ========================================= */
/* REINICIAR TURNO OPEARTIVO */
/* ========================================= */
function reiniciarUnidades(){
    const confirmar = confirm("¿Deseas reiniciar todas las unidades?");
    if(!confirmar) return;

    patrullas.forEach(nombre => {
        localStorage.setItem(nombre + "_estado", false);
        localStorage.setItem(nombre + "_dotacion", 0);
    });

    renderizarPatrullas();
}

/* ========================================= */
/* PERSISTENCIA AUTOMÁTICA DE TEXTOS (NOTAS Y TAC) */
/* ========================================= */
const notas = document.getElementById("notas");
if(notas){
    notas.value = localStorage.getItem("notas") || "";
    notas.addEventListener("input", () => {
        localStorage.setItem("notas", notas.value);
    });
}

["tac1", "tac2", "tac3", "tac4", "tac5"].forEach(id => {
    const campo = document.getElementById(id);
    if(!campo) return;

    campo.value = localStorage.getItem(id) || "";
    campo.addEventListener("input", () => {
        localStorage.setItem(id, campo.value);
    });
});

/* ========================================= */
/* GENERADORES DE COMUNICACIONES */
/* ========================================= */
function mostrarVistaPrevia(texto){
    const vp = document.getElementById("vistaPrevia");
    if(vp) vp.value = texto;
}

function copiarMensaje(texto){
    navigator.clipboard.writeText(texto)
    .then(() => { alert("Mensaje copiado al portapapeles"); })
    .catch(err => { console.error("Error: ", err); });
}

function copiarVistaPrevia(){
    const texto = document.getElementById("vistaPrevia").value;
    if(!texto){
        alert("No hay mensaje para copiar");
        return;
    }
    copiarMensaje(texto);
}

function generar488(){
    const lugar = document.getElementById("roboLugar").value || "[Ubicación]";
    const vehiculo = document.getElementById("roboVehiculo").value || "[Vehículo]";
    const color = document.getElementById("roboColor").value || "[Color]";
    const patente = document.getElementById("roboPatente").value || "[Patente]";
    const atracadores = document.getElementById("roboAtracadores").value || "?";
    const vestimenta = document.getElementById("roboVestimenta").value || "[Vestimenta]";
    const armas = document.getElementById("roboArmas").value || "[Armamento]";
    const codigo = document.getElementById("codigoEvento").value;

    const mensaje = `/r 10-97 al ${codigo} en el lugar ${lugar} | V: ${vehiculo} C: ${color} Matrícula: ${patente} COD-37 | Atracadores: ${atracadores} Vestimenta: ${vestimenta} Portan: ${armas}`;
    mostrarVistaPrevia(mensaje);
}

function generarPatrullaje(){
    const unidad = document.getElementById("patUnidad").value;
    const oficial1 = document.getElementById("patOficial1").value;
    const oficial2 = document.getElementById("patOficial2").value;
    const ubicacion = document.getElementById("patUbicacion").value || "Comisaría Central";

    if(!unidad || !oficial1) {
        alert("Debe seleccionar una unidad e ingresar al oficial de mayor rango.");
        return;
    }

    const calculoDotacion = oficial2.trim() !== "" ? 2 : 1;
    
    // Activa la unidad y guarda dotación en localStorage de manera inmediata
    localStorage.setItem(unidad + "_estado", "true");
    localStorage.setItem(unidad + "_dotacion", calculoDotacion);
    renderizarPatrullas();

    const oficialesTexto = oficial2 ? `${oficial1} y ${oficial2}` : oficial1;
    const mensaje = `/r ${unidad} conformado por ${oficialesTexto}, inician 10-33 desde ${ubicacion}, Good Service.`;
    
    mostrarVistaPrevia(mensaje);
}

function generarSAMS(){
    const elPaciente = document.getElementById("estadoPaciente");
    const estado = elPaciente ? elPaciente.value : "PH";

    const mensaje = `/rff Solicitamos un Alfa en nuestro 10-20 para tratar a un sujeto/agente en estado ${estado}`;
    mostrarVistaPrevia(mensaje);
}

function generarIncautados(){
    const nombre = document.getElementById("incautadoNombre").value || "[Nombre]";
    const objetos = document.getElementById("incautadoObjetos").value || "[Objetos]";
    const mensaje = `/r "${nombre}" | ${objetos} | Procesado por: Tobias Bismarck`;
    
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

/* ========================================= */
/* BOTONES DE RESPUESTA OPERATIVA RÁPIDA */
/* ========================================= */
function generarCodigo4(){
    const codigo = document.getElementById("codigoEvento").value;
    const mensaje = `/r 10-97 del ${codigo} | Cod.4`;
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

function generarSinExito(){
    const codigo = document.getElementById("codigoEvento").value;
    const mensaje = `/r 10-98 al último ${codigo}, sin éxito | Procedemos con 10-22`;
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

function generarRetomar(){
    const codigo = document.getElementById("codigoEvento").value;
    const mensaje = `/r 10-98 del último ${codigo} | Retomamos 10-33`;
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

/* ========================================= */
/* NEGOCIACIONES CONDICIONALES */
/* ========================================= */
function toggleDetalleNegociacion() {
    const lugar = document.getElementById('lugarNegociacion');
    const detalle = document.getElementById('detalleNegociacion');
    if(!lugar || !detalle) return;

    const condicionales = ["24/7", "LTD", "Ammu-Nation", "Robo a Casa"];
    detalle.style.display = condicionales.includes(lugar.value) ? "block" : "none";
}

// Vincula el listener dinámico para tu select de negociaciones
const selectNeg = document.getElementById('lugarNegociacion');
if(selectNeg) {
    selectNeg.addEventListener('change', toggleDetalleNegociacion);
}

function generarNegociacion(){
    const tipo = document.getElementById("tipoNegociacion").value;
    const lugar = document.getElementById("lugarNegociacion").value;
    const detalle = document.getElementById("detalleNegociacion").value;
    
    if(!lugar){
        alert("Por favor, seleccione un tipo de robo.");
        return;
    }

    const ahora = new Date();
    const hora = String(ahora.getHours()).padStart(2, '0') + ":" + String(ahora.getMinutes()).padStart(2, '0');
    const textoTipo = tipo === "termino" ? "término" : "corte";

    let mensaje = "";
    const condicionales = ["24/7", "LTD", "Ammu-Nation", "Robo a Casa"];

    if (condicionales.includes(lugar)) {
        mensaje = `/lspd Se informa el ${textoTipo} de negociaciones en ${lugar} de ${detalle || '[Ubicación]'} a las ${hora}`;
    } else {
        mensaje = `/lspd Se informa el ${textoTipo} de negociaciones en ${lugar} a las ${hora}`;
    }

    mostrarVistaPrevia(mensaje);
}
