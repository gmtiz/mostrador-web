/* ═══════════════════════════════════════════════════════════════
   Mostrador — comportamiento de la página
   Sin librerías ni dependencias: es todo el JavaScript del sitio.
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────
   1. CONFIGURACIÓN — es lo único que tenés que tocar
   ───────────────────────────────────────────────────────────── */
const CONFIG = {
  // Pegá acá el endpoint de Formspree (formspree.io, plan gratis: 50 envíos/mes).
  // Si lo dejás vacío, los formularios abren el correo del visitante con el
  // mensaje ya escrito: la web funciona igual desde el minuto cero.
  endpointFormulario: '',

  email: 'hola@mostrador.com.ar',
  whatsapp: '541132113105',        // código de país + área, sin + ni espacios
  instagram: 'https://instagram.com/tu_usuario',
  tiktok: 'https://tiktok.com/@tu_usuario',

  // Subí el instalador a GitHub Releases y pegá acá el enlace directo.
  descarga: 'descargas/Mostrador-Prueba-Windows.exe'
};

/* ─────────────────────────────────────────────────────────────
   2. Aplicar la configuración al HTML
   ───────────────────────────────────────────────────────────── */
(function aplicarConfig() {
  const wa = document.getElementById('link-whatsapp');
  if (wa) wa.href = 'https://wa.me/' + CONFIG.whatsapp +
    '?text=' + encodeURIComponent('Hola, te escribo por Mostrador.');

  const mail = document.getElementById('link-email');
  if (mail) {
    mail.href = 'mailto:' + CONFIG.email;
    const b = mail.querySelector('b');
    if (b) b.textContent = CONFIG.email;
  }

  const ig = document.getElementById('link-instagram');
  const tt = document.getElementById('link-tiktok');
  if (ig) ig.href = CONFIG.instagram;
  if (tt) tt.href = CONFIG.tiktok;
  document.querySelectorAll('.pie-redes a').forEach((a, i) => {
    a.href = i === 0 ? CONFIG.instagram : CONFIG.tiktok;
    a.target = '_blank'; a.rel = 'noopener';
  });

  const desc = document.getElementById('btn-descarga');
  if (desc) desc.href = CONFIG.descarga;

  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();

/* ─────────────────────────────────────────────────────────────
   3. Barra: sombra al hacer scroll y menú de celular
   ───────────────────────────────────────────────────────────── */
const barra = document.getElementById('barra');
const nav = document.getElementById('nav');
const hamburguesa = document.getElementById('hamburguesa');

addEventListener('scroll', () => {
  barra.classList.toggle('pegada', scrollY > 8);
}, { passive: true });

hamburguesa.addEventListener('click', () => {
  const abierto = nav.classList.toggle('abierto');
  hamburguesa.setAttribute('aria-expanded', String(abierto));
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('abierto');
    hamburguesa.setAttribute('aria-expanded', 'false');
  }
});

/* ─────────────────────────────────────────────────────────────
   4. Pestañas con las capturas
   ───────────────────────────────────────────────────────────── */
document.querySelectorAll('.pestanas-botones button').forEach(boton => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('.pestanas-botones button')
      .forEach(b => b.classList.remove('activa'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('activo'));
    boton.classList.add('activa');
    document.getElementById(boton.dataset.panel).classList.add('activo');
  });
});

/* ─────────────────────────────────────────────────────────────
   5. Aparición suave al entrar en pantalla
   ───────────────────────────────────────────────────────────── */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observador.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.revelar').forEach(el => observador.observe(el));

/* ─────────────────────────────────────────────────────────────
   6. Los botones de precio preseleccionan el motivo del contacto
   ───────────────────────────────────────────────────────────── */
document.querySelectorAll('[data-plan]').forEach(boton => {
  boton.addEventListener('click', () => {
    const select = document.getElementById('select-motivo');
    const mensaje = document.querySelector('#form-contacto [name="mensaje"]');
    if (select) select.selectedIndex = 0;
    if (mensaje && !mensaje.value) {
      mensaje.value = 'Me interesa el plan ' + boton.dataset.plan + '. ';
    }
  });
});

/* ─────────────────────────────────────────────────────────────
   7. Formularios
   ───────────────────────────────────────────────────────────── */
function validar(form) {
  let ok = true;
  form.querySelectorAll('[required]').forEach(campo => {
    const vacio = !campo.value.trim();
    const mailMalo = campo.type === 'email' && campo.value &&
                     !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(campo.value);
    campo.classList.toggle('error', vacio || mailMalo);
    if (vacio || mailMalo) ok = false;
  });
  return ok;
}

function comoTexto(datos, titulo) {
  let texto = titulo + '\n\n';
  for (const [clave, valor] of datos.entries()) {
    if (clave.startsWith('_')) continue;
    texto += clave.charAt(0).toUpperCase() + clave.slice(1) + ': ' + valor + '\n';
  }
  return texto;
}

function conectarFormulario(id, asunto) {
  const form = document.getElementById(id);
  if (!form) return;
  const estado = form.querySelector('.estado-form');
  const boton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    estado.className = 'estado-form';
    estado.textContent = '';

    if (!validar(form)) {
      estado.classList.add('mal');
      estado.textContent = 'Faltan datos: revisá los campos marcados.';
      return;
    }

    const datos = new FormData(form);
    datos.append('_subject', asunto);

    // Sin endpoint configurado: se abre el correo con todo escrito.
    if (!CONFIG.endpointFormulario) {
      const cuerpo = encodeURIComponent(comoTexto(datos, asunto));
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;
      estado.classList.add('ok');
      estado.textContent = 'Te abrí el correo con el mensaje listo. Dale a enviar y lo recibo.';
      return;
    }

    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Enviando…';
    try {
      const r = await fetch(CONFIG.endpointFormulario, {
        method: 'POST',
        body: datos,
        headers: { Accept: 'application/json' }
      });
      if (!r.ok) throw new Error('respuesta ' + r.status);
      form.reset();
      estado.classList.add('ok');
      estado.textContent = '¡Recibido! Te contesto a la brevedad.';
    } catch (err) {
      estado.classList.add('mal');
      estado.innerHTML = 'No pude enviarlo. Escribime directo a ' +
        `<a href="mailto:${CONFIG.email}">${CONFIG.email}</a> o por WhatsApp.`;
    } finally {
      boton.disabled = false;
      boton.textContent = textoOriginal;
    }
  });

  // Limpiar el marcado de error apenas el visitante corrige
  form.querySelectorAll('input,textarea').forEach(campo => {
    campo.addEventListener('input', () => campo.classList.remove('error'));
  });
}

conectarFormulario('form-sugerencias', 'Sugerencia desde la web de Mostrador');
conectarFormulario('form-contacto', 'Consulta desde la web de Mostrador');

/* ─────────────────────────────────────────────────────────────
   8. Aviso al descargar
   ───────────────────────────────────────────────────────────── */
const btnDescarga = document.getElementById('btn-descarga');
if (btnDescarga) {
  btnDescarga.addEventListener('click', () => {
    const aviso = document.createElement('p');
    aviso.className = 'letra-chica claro';
    aviso.style.marginTop = '10px';
    aviso.textContent = 'Empezó la descarga. Si Windows te avisa que no reconoce el ' +
      'programa, tocá «Más información» y después «Ejecutar de todas formas».';
    if (!btnDescarga.parentElement.nextElementSibling.dataset.aviso) {
      btnDescarga.parentElement.after(aviso);
      aviso.dataset.aviso = '1';
    }
  });
}
