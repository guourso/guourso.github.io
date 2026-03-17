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

function renderizar(lista) {
  const container = document.getElementById('lista-bares');
  const emptyState = document.getElementById('empty-state');

  container.innerHTML = '';

  if (lista.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  lista.forEach(bar => {
    const card = document.createElement('div');
    card.className = 'bar-card';

    card.innerHTML = `
      <img src="${bar.imagem}" alt="${bar.bar}">
      <h3>${bar.bar}</h3>
      <p>${bar.prato}</p>
      <button onclick='abrirModal(${JSON.stringify(bar)})'>
        Ver detalhes
      </button>
    `;

    container.appendChild(card);
  });
}

function abrirModal(bar) {
  const content = document.getElementById('modal-content');

  const horariosHTML = (bar.horarios || [])
    .map(h => `<p>${h.dia}: ${h.abertura} - ${h.fechamento}</p>`)
    .join('');

  content.innerHTML = `
    <div style="position: relative;">

      <button class="modal-close" onclick="fecharModal()">✕</button>

      <img src="${bar.imagem}" class="modal-img" alt="${bar.bar}">

      <div class="modal-body">

        <h2>${bar.bar}</h2>

        <p class="modal-prato">${bar.prato}</p>

        <p class="modal-descricao">
          ${bar.descricao || ''}
        </p>

        <div class="modal-info">
          <p><strong>📍 Endereço:</strong> ${bar.endereco}</p>
          <p><strong>📞 Telefone:</strong> ${bar.telefone}</p>
        </div>

        <div class="modal-horarios">
          <h4>Horários de funcionamento</h4>
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