let bares = [];

const lista = document.getElementById('lista-bares');
const searchInput = document.getElementById('search');
const filtroDia = document.getElementById('filtro-dia');
const filtroBairro = document.getElementById('filtro-bairro');
const filtroRegiao = document.getElementById('filtro-regiao');

const modal = document.createElement('div');
modal.classList.add('modal');
modal.innerHTML = `<div class="modal-content" id="modal-content"></div>`;
document.body.appendChild(modal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

fetch('./data.json')
  .then(res => res.json())
  .then(data => {
    bares = data;
    popularBairros();
    popularRegioes();
    renderizar(bares);
  });

function popularBairros() {
  const bairros = [...new Set(bares.map(b => b.bairro).filter(Boolean))];

  bairros.forEach(bairro => {
    const option = document.createElement('option');
    option.value = bairro;
    option.textContent = bairro;
    filtroBairro.appendChild(option);
  });
}

function popularRegioes() {
  const regioes = [...new Set(bares.map(b => b.regiao).filter(Boolean))];

  regioes.forEach(regiao => {
    const option = document.createElement('option');
    option.value = regiao;
    option.textContent = regiao;
    filtroRegiao.appendChild(option);
  });
}

function renderizar(listaBares) {
  lista.innerHTML = '';

  listaBares.forEach(bar => {
    const div = document.createElement('div');
    div.classList.add('bar-card');

    div.innerHTML = `
      <img src="${bar.imagem}" alt="${bar.bar}">
      <div class="bar-card-content">
        <h3>${bar.bar}</h3>
        <p>${bar.prato}</p>
        <small>${bar.bairro} - ${bar.regiao}</small>
        <button>Ver detalhes</button>
      </div>
    `;

    div.querySelector('button').addEventListener('click', () => {
      abrirModal(bar);
    });

    lista.appendChild(div);
  });
}

function abrirModal(bar) {
  const content = document.getElementById('modal-content');

  const horariosHTML = (bar.horarios || [])
    .map(h => `<p><strong>${h.dia}:</strong> ${h.abertura} - ${h.fechamento}</p>`)
    .join('');

  content.innerHTML = `
    <div style="position: relative;">
      <button class="modal-close" onclick="fecharModal()">✕</button>

      <img src="${bar.imagem}" class="modal-img">

      <div class="modal-body">
        <h2>${bar.bar}</h2>
        <p class="modal-sub">${bar.prato}</p>

        <p>${bar.descricao}</p>

        <p><strong>📍</strong> ${bar.endereco}</p>
        <p><strong>📞</strong> ${bar.telefone}</p>

        <div class="modal-horarios">
          <strong>Horários:</strong>
          ${horariosHTML}
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
}

function fecharModal() {
  modal.style.display = 'none';
}

function aplicarFiltros() {
  const termo = searchInput.value.toLowerCase();
  const dia = filtroDia.value;
  const bairro = filtroBairro.value;
  const regiao = filtroRegiao.value;

  const filtrados = bares.filter(bar => {
    return (
      (!termo || bar.bar.toLowerCase().includes(termo)) &&
      (!bairro || bar.bairro === bairro) &&
      (!regiao || bar.regiao === regiao) &&
      (!dia || bar.horarios.some(h => h.dia === dia))
    );
  });

  renderizar(filtrados);
}

searchInput.addEventListener('input', aplicarFiltros);
filtroDia.addEventListener('change', aplicarFiltros);
filtroBairro.addEventListener('change', aplicarFiltros);
filtroRegiao.addEventListener('change', aplicarFiltros);