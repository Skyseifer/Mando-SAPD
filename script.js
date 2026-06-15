const patrullas = [
    "ADAM 10", "ADAM 20", "ADAM 30", "ADAM 40",
    "ADAM 50", "ADAM 60", "ADAM 70", "ADAM 80",
    "MERIT 01", "MERIT 02", "MERIT 03"
];

/* ========================================= */
/* RELOJ (Formato 24 Horas) */
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
/* INICIALIZACIÓN Y PERSISTENCIA (DOM) */
/* ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    actualizarReloj();
    renderizarPatrullas();
    toggleDetalleNegociacion();
    actualizarSelectOficiales(); // NUEVO: Inicializa el selector dinámico de oficiales

    // Inicializar acordeón del manual
    const botonesAcordeon = document.querySelectorAll(".acordeon-btn");
    botonesAcordeon.forEach(boton => {
        boton.addEventListener("click", () => {
            const contenido = boton.nextElementSibling;
            if(contenido.style.display === "block"){
                contenido.style.display = "none";
            } else {
                contenido.style.display = "block";
            }
        });
    });

    // Cargar Notas Guardadas
    const notas = document.getElementById("notas");
    if(notas){
        notas.value = localStorage.getItem("notas") || "";
        notas.addEventListener("input", () => localStorage.setItem("notas", notas.value));
    }

    // Cargar Canales TAC Guardados
    ["tac1","tac2","tac3","tac4","tac5"].forEach(id => {
        const campo = document.getElementById(id);
        if(campo) {
            campo.value = localStorage.getItem(id) || "";
            campo.addEventListener("input", () => localStorage.setItem(id, campo.value));
        }
    });

    // Cargar el ID de Anuncios automáticamente si existe el campo
    const campoIdAnuncio = document.getElementById("anuncioId");
    if(campoIdAnuncio){
        campoIdAnuncio.value = localStorage.getItem("ultimo_id_anuncio") || "";
        campoIdAnuncio.addEventListener("input", () => {
            localStorage.setItem("ultimo_id_anuncio", campoIdAnuncio.value);
        });
    }
});

/* ========================================= */
/* CONTROL DE FLOTA OPERATIVA */
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

function renderizarPatrullas(){
    const contenedor = document.getElementById("listaPatrullas");
    if(!contenedor) return;

    contenedor.innerHTML = "";
    let disponibles = 0;
    let oficialesDisponibles = 0;

    const adam = patrullas.filter(p => p.includes("ADAM"));
    const merit = patrullas.filter(p => p.includes("MERIT"));

    function crearGrupo(titulo, lista){
        let html = `<div class="titulo-grupo">${titulo}</div><div class="grupo-unidades">`;
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
                            <button class="${dotacion === num ? "activo" : ""}" onclick="guardarDotacion('${nombre}',${num})">${num}</button>
                        `).join('')}
                    </div>
                </div>`;
        });
        html += `</div>`;
        return html;
    }

    contenedor.innerHTML += crearGrupo("ADAM", adam);
    contenedor.innerHTML += crearGrupo("MERIT", merit);

    // Actualizar tarjetas de estadísticas de la pestaña Operaciones
    const elDisp = document.getElementById("disponibles");
    const elNoDisp = document.getElementById("nodisponibles");
    const elOfi = document.getElementById("oficialesDisponibles");

    if(elDisp) elDisp.innerText = disponibles;
    if(elNoDisp) elNoDisp.innerText = patrullas.length - disponibles;
    if(elOfi) elOfi.innerText = oficialesDisponibles;
}

function reiniciarUnidades(){
    if(!confirm("¿Deseas reiniciar todas las unidades?")) return;
    patrullas.forEach(nombre => {
        localStorage.setItem(nombre + "_estado", false);
        localStorage.setItem(nombre + "_dotacion", 0);
    });
    renderizarPatrullas();
}

/* ========================================= */
/* REPOSITORIO DE FUNCIONES AUXILIARES */
/* ========================================= */
function mostrarVistaPrevia(texto){
    const vp = document.getElementById("vistaPrevia");
    if(vp) vp.value = texto;
}

function copiarMensaje(texto){
    navigator.clipboard.writeText(texto)
    .then(() => { alert("Mensaje copiado con éxito."); })
    .catch(() => { alert("Error al copiar automáticamente."); });
}

function copiarVistaPrevia(){
    const texto = document.getElementById("vistaPrevia").value;
    if(!texto) return alert("No hay mensaje estructurado.");
    copiarMensaje(texto);
}

/* ========================================= */
/* GESTIÓN DINÁMICA DE OFICIALES (INCAUTACIONES) */
/* ========================================= */
function obtenerOficialesGuardados() {
    const lista = localStorage.getItem("lista_oficiales_incautadores");
    return lista ? JSON.parse(lista) : ["Eduardo Vinicius"];
}

function actualizarSelectOficiales(seleccionarNombre = "") {
    const select = document.getElementById("incautadoOficialSelect");
    if (!select) return;

    const oficiales = obtenerOficialesGuardados();
    const ultimoSeleccionado = seleccionarNombre || localStorage.getItem("ultimo_oficial_incautador") || oficiales[0];

    let html = '<option value="">-- Selecciona Oficial que Procesa --</option>';
    oficiales.forEach(ofi => {
        html += `<option value="${ofi}" ${ofi === ultimoSeleccionado ? "selected" : ""}>👮‍♂️ ${ofi}</option>`;
    });
    html += '<option value="__NUEVO__">✍️ Agregar nuevo oficial...</option>';
    
    select.innerHTML = html;
    verificarNuevoOficial();
}

function verificarNuevoOficial() {
    const select = document.getElementById("incautadoOficialSelect");
    const inputNuevo = document.getElementById("incautadoOficialNuevo");
    if (!select || !inputNuevo) return;

    if (select.value === "__NUEVO__") {
        inputNuevo.style.display = "block";
        inputNuevo.focus();
    } else {
        inputNuevo.style.display = "none";
        if (select.value) {
            localStorage.setItem("ultimo_oficial_incautador", select.value);
        }
    }
}

/* ========================================= */
/* GENERADORES DE COMUNICADOS RADIALES */
/* ========================================= */
function generar488(){
    const lugar = document.getElementById("roboLugar").value || "[Lugar]";
    const vehiculo = document.getElementById("roboVehiculo").value || "[Vehículo]";
    const color = document.getElementById("roboColor").value || "[Color]";
    const patente = document.getElementById("roboPatente").value || "[Patente]";
    const atracadores = document.getElementById("roboAtracadores").value || "?";
    const rehenes = document.getElementById("roboRehenes").value || "0";
    const vestimenta = document.getElementById("roboVestimenta").value || "[Vestimenta]";
    const armas = document.getElementById("roboArmas").value || "[Armamento]";
    const codigo = document.getElementById("codigoEvento").value;

    const mensaje = `/r 10-97 al ${codigo} del lugar ${lugar} | V: ${vehiculo} C: ${color} Matricula: ${patente} COD-37 | Atracadores: ${atracadores} Vestimenta: ${vestimenta} Portan: ${armas} | Rehenes: ${rehenes}`;
    mostrarVistaPrevia(mensaje);
}

function generarPatrullaje(){
    const unidad = document.getElementById("patUnidad").value;
    const oficial1 = document.getElementById("patOficial1").value;
    const oficial2 = document.getElementById("patOficial2").value;
    const ubicacion = document.getElementById("patUbicacion").value || "Comisaría Central";

    if(!unidad || !oficial1) return alert("Faltan datos obligatorios.");

    const calculoDotacion = oficial2.trim() !== "" ? 2 : 1;
    localStorage.setItem(unidad + "_estado", "true");
    localStorage.setItem(unidad + "_dotacion", calculoDotacion);
    renderizarPatrullas();

    const oficialesTexto = oficial2 ? `${oficial1} y ${oficial2}` : oficial1;
    const mensaje = `/r ${unidad} conformado por ${oficialesTexto}, inician 10-33 desde ${ubicacion}, Good Service.`;
    mostrarVistaPrevia(mensaje);
}

function generarSAMS(tipoPaciente){
    const elPaciente = document.getElementById("estadoPaciente");
    const estado = elPaciente ? elPaciente.value : "Estable";
    const stringPaciente = tipoPaciente === "agente" ? "un agente" : "un sujeto";

    const mensaje = `/rff Solicitamos un Alfa en nuestro 10-20 para tratar a ${stringPaciente} en estado ${estado}`;
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

function generarIncautados(){
    const nombre = document.getElementById("incautadoNombre").value || "[Sujeto]";
    const objetos = document.getElementById("incautadoObjetos").value || "[Objetos]";
    const selectOficial = document.getElementById("incautadoOficialSelect");
    let oficial = selectOficial ? selectOficial.value : "";

    // Lógica para registrar un oficial nuevo si está seleccionado
    if (oficial === "__NUEVO__") {
        const inputNuevo = document.getElementById("incautadoOficialNuevo");
        const nuevoNombre = inputNuevo ? inputNuevo.value.trim() : "";

        if (!nuevoNombre) {
            return alert("Por favor, escribe el nombre del nuevo oficial.");
        }

        let listaOficiales = obtenerOficialesGuardados();
        if (!listaOficiales.includes(nuevoNombre)) {
            listaOficiales.push(nuevoNombre);
            listaOficiales.sort(); // Mantener orden alfabético
            localStorage.setItem("lista_oficiales_incautadores", JSON.stringify(listaOficiales));
        }

        oficial = nuevoNombre;
        localStorage.setItem("ultimo_oficial_incautador", oficial);
        
        inputNuevo.value = "";
        actualizarSelectOficiales(oficial);
    }

    if (!oficial) {
        oficial = "[Oficial]";
    }

    const mensaje = `/r ${nombre} | ${objetos} | Procesado por: ${oficial}`;
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

/* ========================================= */
/* GENERADORES DE ANUNCIOS LSPD (CIUDADANÍA) */
/* ========================================= */
function generarAnuncioDisponibles() {
    const oficiales = document.getElementById("oficialesDisponibles").innerText || "0";
    const idUsuario = document.getElementById("anuncioId").value;

    if (!idUsuario || idUsuario < 1 || idUsuario > 100) {
        return alert("Por favor, ingresa un ID válido entre 1 y 100 antes de generar el mensaje.");
    }

    const mensaje = `/lspd Se informa que se encuentran ${oficiales} oficiales disponibles para la ciudadania ID: ${idUsuario}`;
    
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

function generarAnuncioNoDisponibles() {
    const mensaje = `/lspd Se informa que no se encuentran oficiales disponibles en este momento`;
    
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}

/* ========================================= */
/* ACCIONES RÁPIDAS (CLAVES RADIALES) */
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
/* LÓGICA DE NEGOCIACIONES CON HORA REAL */
/* ========================================= */
function toggleDetalleNegociacion() {
    const lugar = document.getElementById('lugarNegociacion');
    const detalle = document.getElementById('detalleNegociacion');
    if(!lugar || !detalle) return;

    const condicionales = ["24/7", "LTD", "Ammu-Nation", "Robo a Casa"];
    detalle.style.display = condicionales.includes(lugar.value) ? "block" : "none";
}

function generarNegociacion(tipoAccion){
    const lugar = document.getElementById("lugarNegociacion").value;
    const detalle = document.getElementById("detalleNegociacion").value;
    
    if(!lugar) return alert("Debe seleccionar un robo de la lista.");

    const ahora = new Date();
    const horaExacta = String(ahora.getHours()).padStart(2, '0') + ":" + String(ahora.getMinutes()).padStart(2, '0');
    
    const textoAccion = tipoAccion === "termino" ? "termino" : "corte";
    const condicionales = ["24/7", "LTD", "Ammu-Nation", "Robo a Casa"];

    let mensaje = "";
    if (condicionales.includes(lugar)) {
        mensaje = `/lspd Se informa el ${textoAccion} de negociaciones en ${lugar} de ${detalle || '[Especificar]'} a las ${horaExacta}`;
    } else {
        mensaje = `/lspd Se informa el ${textoAccion} de negociaciones en ${lugar} a las ${horaExacta}`;
    }

    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);
}
