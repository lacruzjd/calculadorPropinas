const cabezasName = ['Carlos', 'viejo', 'lalo', 'David', 'Nacho', 'flaco', 'Juan', 'JuanCarlos', "Rony"]

const cabezaObj = cabezasName.map(cabeza => { return { cabeza: cabeza } })

let totalPropinasRecibidas = 0
let cabezastotal = 0
let propinaPorCabeza = 0
let propinaPorDia = 0

let descuentosTotal = 0
let propinaEntregada = 0
let restos = 0


document.body.appendChild(crearFormularioConSubmitYDiv('totalpropina', 'totalbody', 'enviar'))
const totalnodo = document.querySelector('#totalpropina')

const bodyTotal = totalnodo.querySelector('#totalbody')
bodyTotal.appendChild(crearInputConLabel('number', 'totalpropina', 0, 'Tota Propina', false))

totalnodo.onsubmit = (e) => {
    e.preventDefault()
    if(document.body.childElementCount > 2){
        document.body.lastChild.remove()
    }
    const data = new FormData(totalnodo)
    const dataToSend = Object.fromEntries(data.entries())
    totalPropinasRecibidas = dataToSend.totalpropina

    document.body.appendChild(crearFormularioConSubmitYDiv('cabezas', 'cabezasbody', 'Generar Propinas'))
    const cabezaForm = document.querySelector('#cabezas')
    const cabezasBody = document.querySelector('#cabezasbody')

    cabezasName.forEach((opcion, index) => {
        cabezasBody.appendChild(crearCheckbox(opcion, opcion, opcion, opcion))
    });

    cabezaForm.onsubmit = (e) => {
        if(document.body.childElementCount > 3){
            document.body.lastChild.remove()
        }

        e.preventDefault()
        const data = new FormData(cabezaForm)
        const cabezasPorPropina = Array.from(data.entries())

        propinaPorCabeza = Math.floor(totalPropinasRecibidas / cabezasPorPropina.length)
        propinaPorDia = Math.floor((totalPropinasRecibidas / cabezasPorPropina.length) / 7)

        
        cabezastotal = cabezasPorPropina.length
        
        const cabezaObj = cabezasPorPropina.map(e => { return { cabeza: e[0], dias: 7, adelanto: 0, total: 0 } })
        
        setPropina(cabezaObj, dataToSend.totalpropina)
        
        document.body.appendChild(crearFormularioConSubmitYDiv('descuentos', 'descuentosbody', 'Hacer descuentos'))
        const bodyFomrDescuentos = document.querySelector(`#descuentos`)
        
        bodyFomrDescuentos.appendChild(createDivWithParagraphs([
            `Total Recibidas: ${totalPropinasRecibidas}`,
        `Propina por cabeza: ${propinaPorCabeza}`, `Propina por Dia: ${propinaPorDia}`]))
        
        const formDescuentos = document.querySelector('#descuentos')
        const bodydescunetos = formDescuentos.querySelector('#descuentosbody')

        cabezaObj.forEach(cabeza => {
            const div = document.createElement('div')
            const nombre = document.createElement('h2')
            nombre.textContent = cabeza.cabeza
            div.appendChild(nombre)
            div.appendChild(crearInputConLabel('text', cabeza.cabeza, cabeza.cabeza, 'Cabeza', true))
            div.appendChild(crearInputConLabel('number', 'dias', cabeza.dias, 'Dias', false))
            div.appendChild(crearInputConLabel('number', 'adelanto', cabeza.adelanto, 'Adelanto', false))
            div.appendChild(crearInputConLabel('number', 'total', cabeza.total, 'Total', true))
            bodydescunetos.appendChild(div)
        })

        formDescuentos.onsubmit = (e) => {
            e.preventDefault()
            if(document.body.childElementCount > 4){
                document.body.lastChild.remove()
            }

            const datos = []

            for (let i = 0; i < formDescuentos.elements.length - 1; i++) {
                const input = formDescuentos.elements[i];
                datos.push(input.value)
            }

            const descuentos = [];
            for (let i = 0; i < datos.length; i += 4) {
                const cabeza = datos[i];
                const dias = parseInt(datos[i + 1]);
                const adelanto = parseInt(datos[i + 2]);

                const objetoGrupo = {
                    cabeza,
                    dias,
                    adelanto,
                };

                descuentos.push(objetoGrupo);
            }

            setDescuentos(cabezaObj, descuentos)
            setRestos(cabezaObj)
            redondearToCien(cabezaObj)
            const totales = cabezaObj.map(e => {
                return {cabeza: e.cabeza, total: e.total}
            })

            document.body.appendChild(crearTabla(totales))
            console.log(cabezaObj)


        }

    }


}

const setPropina = (cabezaObj, totalPropinasRecibidas) => {
    return cabezaObj.map(cabeza => {
        cabeza.total = Math.floor(totalPropinasRecibidas / cabezaObj.length)
        return cabeza
    })
}

const setDescuentos = (setPropinas, descuentos) => {
    return setPropinas.map((propina, i) => {
        descuentos.map(descuento => {
            if (propina.cabeza === descuento.cabeza) {
                // solo descuento de adelanto
                if (descuento.adelanto > 0 && descuento.dias === 7) {
                    propina.total = Math.floor(propina.total - descuento.adelanto)
                    descuentosTotal = Math.floor(descuentosTotal + descuento.adelanto)
                    // console.log(propina)
                }
                //solo pago dias trabajados
                if (descuento.dias < 7 && descuento.adelanto === 0) {
                    descuentosTotal = Math.floor(descuentosTotal + propina.total - (propinaPorDia * descuento.dias))
                    propina.total = Math.floor(propinaPorDia * descuento.dias)
                    // console.log(propina)
                }

                //pago por dia y descuento por adelanto
                if (descuento.dias < 7 && descuento.adelanto > 0) {
                    descuentosTotal = Math.floor(descuentosTotal + propina.total - (propinaPorDia * descuento.dias))
                    descuentosTotal = Math.floor(descuentosTotal + descuento.adelanto)
                    propina.total = Math.floor(propinaPorDia * descuento.dias)
                    propina.total = Math.floor(propina.total - descuento.adelanto)
                    // console.log(propina)
                }


            } else {
                return propina
            }
        })
        propinaEntregada = totalPropinasRecibidas - descuentosTotal
        return propina
    })
}

const setRestos = (resultadoDescuentos) => {
    propinaEntregada = propinaEntregada + descuentosTotal;
    const restosCadaUno = resultadoDescuentos.filter(e => e.total === propinaPorCabeza).length
    return resultadoDescuentos.map((cabeza) => {
        if (cabeza.total === propinaPorCabeza) {
            cabeza.total = Math.floor(cabeza.total + descuentosTotal / restosCadaUno)
            return cabeza
        }

        return cabeza
    })
}

let totalEntregado = 0
const redondearToCien = (arr = []) => {
    return arr.map(e => {

        const { redondeado, restante } = redondearYRestante(e.total)
        restos = restos + restante
        e.total = redondeado
        totalEntregado = totalEntregado + e.total
        return e

    })

}

function redondearYRestante(numero) {
    let redondeado = Math.floor(numero / 100) * 100;
    let restante = numero % 100;
    return { redondeado, restante };
}

// inferfaz

function crearFormularioConSubmitYDiv(idFormulario, idDiv, buttonName) {
    const formulario = document.createElement('form');
    formulario.id = idFormulario; // Asigna el ID al formulario

    const divContenedor = document.createElement('div');
    divContenedor.id = idDiv; // Asigna el ID al div

    const inputSubmit = document.createElement('input');
    inputSubmit.type = 'submit';
    inputSubmit.value = buttonName; // Texto del botón de envío

    formulario.appendChild(divContenedor); // Agrega el div al formulario
    formulario.appendChild(inputSubmit); // Agrega el input submit

    return formulario;
}

// funciones 
function crearInputConLabel(tipo, nombre, valor, textoLabel, readOnly, hidden) {
    const contenedor = document.createElement('div'); // Contenedor para el input y el label
    const nuevoLabel = document.createElement('label');
    nuevoLabel.textContent = textoLabel; // Texto del label

    const nuevoInput = document.createElement('input');
    nuevoInput.type = tipo;
    nuevoInput.name = nombre;
    nuevoInput.value = valor;

    if (readOnly) {
        nuevoInput.readOnly = true; // Establece el atributo readOnly si se proporciona
    }

    if (hidden) {
        nuevoLabel.hidden = true
        nuevoInput.remove()
        nuevoInput.hidden = true; // Establece el atributo hidden si se proporciona
    }

    // Agrega el label y el input al contenedor
    contenedor.appendChild(nuevoLabel);
    contenedor.appendChild(nuevoInput);

    return contenedor;
}

function crearCheckbox(nombre, valor, id, etiqueta) {
    const contenedor = document.createElement('div'); // Contenedor para el checkbox y la etiqueta

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = nombre;
    checkbox.value = valor;
    checkbox.id = id;

    const label = document.createElement('label');
    label.textContent = etiqueta;
    label.setAttribute('for', id); // Asocia la etiqueta al checkbox mediante el atributo 'for'

    // Agrega el checkbox y la etiqueta al contenedor
    contenedor.appendChild(checkbox);
    contenedor.appendChild(label);

    return contenedor;
}



function createDivWithParagraphs(paragraphTexts) {
    // Crear el elemento div
    const div = document.createElement('div');

    // Crear y anidar párrafos dentro del div
    paragraphTexts.forEach((text, index) => {
        const p = document.createElement('p');
        p.textContent = text;
        div.appendChild(p);
    });

    return div;
}

function crearTabla(datos) {
    const tabla = document.createElement('table');
    const thead = document.createElement('thead');
    const encabezadoFila = document.createElement('tr');
    const encabezados = ['Cabeza', 'Total'];

    encabezados.forEach(encabezado => {
        const th = document.createElement('th');
        th.textContent = encabezado;
        encabezadoFila.appendChild(th);
    });

    thead.appendChild(encabezadoFila);
    tabla.appendChild(thead);

    const tbody = document.createElement('tbody');

    datos.forEach(dato => {
        const fila = document.createElement('tr');
        Object.values(dato).forEach(valor => {
            const celda = document.createElement('td');
            celda.textContent = valor;
            fila.appendChild(celda);
        });
        tbody.appendChild(fila);
    });

    tabla.appendChild(tbody);

    return tabla;
}

// console.log(setPropina(cabezaObj, totalPropinasRecibidas))
// console.log(setDescuentos(cabezaObj, descuentos))
// console.log(setRestos(setDescuentos(cabezaObj, descuentos)))
// console.log(redondearToCien(setRestos(setDescuentos(cabezaObj, descuentos))))
// console.log(`total propina recibida: ${ totalPropinasRecibidas }`)
// console.log(`propina por dia: ${ propinaPorDia }`)
// console.log(`descuentos Total: ${ descuentosTotal }`)
// console.log(`propina Entregada: ${ propinaEntregada - restos}`)
// console.log(`restos: ${ restos } `)
// console.log(`total Entregado: ${ totalEntregado } `)






