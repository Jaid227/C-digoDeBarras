
// 1. Simulación de Base de Datos en el mismo script
const baseDatosProductos = {
    "7501234567890": { nombre: "Refresco de Cola 600ml", precio: 18.50 },
    "12345678": { nombre: "Galletas de Chispas", precio: 15.00 },
    "ALFA9876": { nombre: "Código Alfanumérico 128", precio: 120.00 }
};

// Variables globales
let html5QrcodeScanner = null;
let productoActual = null;
let ventasDelDia = JSON.parse(localStorage.getItem('ventas_dia')) || [];

// Elementos del DOM
const btnScan = document.getElementById('btn-scan');
const cardInfo = document.getElementById('product-info');
const prodCode = document.getElementById('prod-code');
const prodName = document.getElementById('prod-name');
const prodPrice = document.getElementById('prod-price');
const btnAdd = document.getElementById('btn-add');
const salesList = document.getElementById('sales-list');
const totalDay = document.getElementById('total-day');

// Inicializar interfaz con datos guardados
actualizarListaVentas();

// 2. Lógica de la Cámara y Escaneo
btnScan.addEventListener('click', () => {
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }

    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Fuerza el uso de la cámara trasera
        config,
        (decodedText) => {
            // Código leído con éxito
            buscarProducto(decodedText);
            html5QrcodeScanner.stop(); // Detiene la cámara tras leerlo
        },
        (errorMessage) => {
            // Error de escaneo continuo (ignorar para evitar spam de alertas)
        }
    ).catch(err => alert("Error al acceder a la cámara: " + err));
});

// 3. Buscar en "Base de Datos"
function buscarProducto(codigo) {
    const producto = baseDatosProductos[codigo];
    
    if (producto) {
        productoActual = { codigo, ...producto };
        prodCode.textContent = codigo;
        prodName.textContent = producto.nombre;
        prodPrice.textContent = producto.precio.toFixed(2);
        cardInfo.classList.remove('hidden');
    } else {
        alert(`Código leído: ${codigo}\nProducto no registrado en la base de datos.`);
        cardInfo.classList.add('hidden');
    }
}

// 4. Agregar a la lista de ventas
btnAdd.addEventListener('click', () => {
    if (productoActual) {
        ventasDelDia.push({
            ...productoActual,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        // Guardar permanentemente en el navegador
        localStorage.setItem('ventas_dia', JSON.stringify(ventasDelDia));
        
        actualizarListaVentas();
        cardInfo.classList.add('hidden'); // Ocultar tarjeta
        productoActual = null;
    }
});

// 5. Renderizar ventas e histórico financiero
function actualizarListaVentas() {
    salesList.innerHTML = "";
    let total = 0;

    ventasDelDia.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.hora} - ${item.nombre}</span> <strong>$${item.precio.toFixed(2)}</strong>`;
        salesList.appendChild(li);
        total += item.price || item.precio; // Respaldo de compatibilidad de variables
    });

    totalDay.textContent = total.toFixed(2);
}