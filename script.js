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
    actualizarSelectOficialesPatrulla(1);
    actualizarSelectOficialesPatrulla(2);
    actualizarSelectLugaresPatrulla();
  
    // Inicializar selectores dinámicos
    actualizarSelectOficiales(); 
    actualizarSelectLugares(); // Inicializa el selector dinámico de lugares de robo

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
        notes.value = localStorage.getItem("notas") || "";
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
/* GESTIÓN DINÁMICA DE LUGARES DE ROBO       */
/* ========================================= */
function obtenerLugaresGuardados() {
    const lista = localStorage.getItem("lista_lugares_robo");
    return lista ? JSON.parse(lista) : ["Joyería Vangelico", "Artifact", "Barco de Drogas", "Yate", "Tren Merryweather", "Banco Paleto", "Union Depository"];
}

function actualizarSelectLugares(seleccionarLugar = "") {
    const select = document.getElementById("roboLugarSelect");
    if (!select) return;

    const lugares = obtenerLugaresGuardados();
    const ultimoSeleccionado = seleccionarLugar || localStorage.getItem("ultimo_lugar_robo") || "";

    let html = '<option value="">🗺️ Seleccionar Ubicación / Lugar</option>';
    lugares.forEach(lug => {
        html += `<option value="${lug}" ${lug === ultimoSeleccionado ? "selected" : ""}>📍 ${lug}</option>';
    });
    html += '<option value="__NUEVO__">✍️ Agregar nuevo lugar...</option>';

    select.innerHTML = html;
    verificarNuevoLugar();
}

function verificarNuevoLugar() {
    const select = document.getElementById("roboLugarSelect");
    const inputNuevo = document.getElementById("roboLugarNuevo");
    if (!select || !inputNuevo) return;

    if (select.value === "__NUEVO__") {
        inputNuevo.style.display = "block";
        inputNuevo.focus();
    } else {
        inputNuevo.style.display = "none";
        if (select.value) {
            localStorage.setItem("ultimo_lugar_robo", select.value);
        }
    }
}

/* ========================================= */
/* GENERADORES DE COMUNICADOS RADIALES       */
/* ========================================= */

// FIJADO: Función corregida para procesar y despachar el reporte de Radio Interna
function generarReporteRobo(){
    const selectLugar = document.getElementById("roboLugarSelect");
    let lugar = selectLugar ? selectLugar.value : "";

    if (lugar === "__NUEVO__") {
        const inputNuevo = document.getElementById("roboLugarNuevo");
        const nuevoLugar = inputNuevo ? inputNuevo.value.trim() : "";

        if (!nuevoLugar) {
            return alert("Por favor, escribe el nombre del nuevo lugar.");
        }

        let listaLugares = obtenerLugaresGuardados();
        if (!listaLugares.includes(nuevoLugar)) {
            listaLugares.push(nuevoLugar);
            listaLugares.sort();
            localStorage.setItem("lista_lugares_robo", JSON.stringify(listaLugares));
        }

        lugar = nuevoLugar;
        localStorage.setItem("ultimo_lugar_robo", lugar);

        if(inputNuevo) inputNuevo.value = "";
        actualizarSelectLugares(lugar);
    }

    if (!lugar) {
        lugar = "[Lugar]";
    }

    const tipoRobo = document.getElementById("roboTipoCodigo").value;
    const vehiculo = document.getElementById("roboVehiculo").value || "[Vehículo]";
    const color = document.getElementById("roboColor").value || "[Color]";
    const patente = (document.getElementById("roboPatente").value || "[Patente]").toUpperCase();
    const atracadores = document.getElementById("roboAtracadores").value || "?";
    const rehenes = document.getElementById("roboRehenes").value || "0";
    const vestimenta = document.getElementById("roboVestimenta").value || "[Vestimenta]";
    const armas = document.getElementById("roboArmas").value || "[Armamento]";

    const mensaje = `/r 10-97 al ${tipoRobo} del lugar ${lugar} | V: ${vehiculo} C: ${color} Matricula: ${patente} COD-37 | Atracadores: ${atracadores} Vestimenta: ${vestimenta} Portan: ${armas} | Rehenes: ${rehenes}`;
    
    mostrarVistaPrevia(mensaje);
    copiarMensaje(mensaje);

    document.getElementById("roboVehiculo").value = "";
    document.getElementById("roboColor").value = "";
    document.getElementById("roboPatente").value = "";
    document.getElementById("roboAtracadores").value = "";
    document.getElementById("roboRehenes").value = "";
    document.getElementById("roboVestimenta").value = "";
    document.getElementById("roboArmas").value = "";
    if(selectLugar) selectLugar.value = "";
    verificarNuevoLugar();
}

function generarPatrullaje() {
    const unidad = document.getElementById("patUnidad").value || "[Unidad]";
    
    const selectOf1 = document.getElementById("patOficial1Select");
    let oficial1 = selectOf1 ? selectOf1.value : "";
    if (oficial1 === "__NUEVO__") {
        const nuevoOf1 = document.getElementById("patOficial1Nuevo").value.trim();
        if (!nuevoOf1) return alert("Por favor, escribe el nombre del Oficial 1.");
        
        let lista = obtenerOficialesGuardados();
        if (!lista.includes(nuevoOf1)) {
            lista.push(nuevoOf1);
            lista.sort();
            localStorage.setItem("lista_oficiales_incautadores", JSON.stringify(lista));
            actualizarSelectOficiales();
        }
        oficial1 = nuevoOf1;
    }

    const selectOf2 = document.getElementById("patOficial2Select");
    let
