let bares = [];
let ingredientes = [];
let tagsSelecionadas = [];

// =========================
// CARREGAMENTO INICIAL
// =========================
async function carregarDados() {
  const resBares = await fetch('./bares.json');
  bares = await resBares.json();

  const resIngredientes = await fetch('./ingredientes.json');
  const dataIngredientes = await resIngredientes.json();
  ingredientes = dataIngredientes.todos_ingredientes;

  popularFiltros();
  carregarFiltrosSalvos(); // 🔥 carrega filtros

  aplicarFiltros();
}

carregarDados();

// =========================
// FILTROS (BAIRRO / REGIÃO)
// =========================
function popularFiltros() {
  const bairros = [...new Set(bares.map(b => b.bairro))];
  const regioes = [...new Set(bares.map(b => b.regiao))];

  const selectBairro = document.getElementById('filtro-bairro');
  const selectRegiao = document.getElementById('filtro-regiao');

  bairros.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.innerText = b;
    selectBairro.appendChild(opt);
  });

  regioes.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.innerText = r;
    selectRegiao.appendChild(opt);
  });
}

// =========================
// RENDERIZAÇÃO
// =========================
function renderizarBares(lista) {
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
      <div class="bar-card-content">
        <h3>${bar.bar}</h3>
        <p>${bar.prato}</p>
        <button onclick='abrirModal(${JSON.stringify(bar)})'>
          Ver detalhes
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// =========================
// FILTROS
// =========================
function aplicarFiltros() {
  const busca = document.getElementById('search').value.toLowerCase();
  const dia = document.getElementById('filtro-dia').value;
  const bairro = document.getElementById('filtro-bairro').value;
  const regiao = document.getElementById('filtro-regiao').value;

  const filtrados = bares.filter(bar => {
    const texto = (bar.prato + ' ' + bar.descricao).toLowerCase();

    const matchBusca = bar.bar.toLowerCase().includes(busca);

    const matchDia =
      !dia ||
      (bar.horarios || []).some(h => h.dia === dia);

    const matchBairro = !bairro || bar.bairro === bairro;
    const matchRegiao = !regiao || bar.regiao === regiao;

    const matchTags =
      tagsSelecionadas.length === 0 ||
      tagsSelecionadas.some(tag =>
        texto.includes(tag.toLowerCase())
      );

    return matchBusca && matchDia && matchBairro && matchRegiao && matchTags;
  });

  renderizarBares(filtrados);

  salvarFiltros(); // 🔥 salva sempre
}

// =========================
// EVENTOS DOS FILTROS
// =========================
document.getElementById('search').addEventListener('input', aplicarFiltros);
document.getElementById('filtro-dia').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-bairro').addEventListener('change', aplicarFiltros);
document.getElementById('filtro-regiao').addEventListener('change', aplicarFiltros);

// =========================
// LOCAL STORAGE
// =========================
function salvarFiltros() {
  const filtros = {
    busca: document.getElementById('search').value,
    dia: document.getElementById('filtro-dia').value,
    bairro: document.getElementById('filtro-bairro').value,
    regiao: document.getElementById('filtro-regiao').value,
    tags: tagsSelecionadas
  };

  localStorage.setItem('filtrosBares', JSON.stringify(filtros));
}

function carregarFiltrosSalvos() {
  const data = localStorage.getItem('filtrosBares');
  if (!data) return;

  const filtros = JSON.parse(data);

  document.getElementById('search').value = filtros.busca || '';
  document.getElementById('filtro-dia').value = filtros.dia || '';
  document.getElementById('filtro-bairro').value = filtros.bairro || '';
  document.getElementById('filtro-regiao').value = filtros.regiao || '';

  if (filtros.tags && filtros.tags.length > 0) {
    filtros.tags.forEach(tag => adicionarTag(tag));
  }
}

// =========================
// BOTÃO LIMPAR FILTROS
// =========================
document.getElementById('limpar-filtros').addEventListener('click', () => {
  document.getElementById('search').value = '';
  document.getElementById('filtro-dia').value = '';
  document.getElementById('filtro-bairro').value = '';
  document.getElementById('filtro-regiao').value = '';

  tagsSelecionadas = [];
  document.getElementById('filtro-tags').innerHTML = '';

  localStorage.removeItem('filtrosBares');

  aplicarFiltros();
});

// =========================
// AUTOCOMPLETE DE TAGS
// =========================
const inputTag = document.getElementById('input-tag');
const sugestoesBox = document.getElementById('sugestoes-tags');

inputTag.addEventListener('input', () => {
  const valor = inputTag.value.toLowerCase();

  sugestoesBox.innerHTML = '';

  if (!valor) return;

  const filtradas = ingredientes
    .filter(i => i.toLowerCase().includes(valor))
    .slice(0, 10);

  if (filtradas.length === 0) {
    sugestoesBox.innerHTML = `<div class="sugestao-item">Nenhum resultado</div>`;
    return;
  }

  filtradas.forEach(item => {
    const div = document.createElement('div');
    div.className = 'sugestao-item';

    div.innerHTML = item.replace(
      new RegExp(valor, 'gi'),
      match => `<strong>${match}</strong>`
    );

    div.addEventListener('click', () => {
      adicionarTag(item);
      inputTag.value = '';
      sugestoesBox.innerHTML = '';
    });

    sugestoesBox.appendChild(div);
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.busca-tags')) {
    sugestoesBox.innerHTML = '';
  }
});

// =========================
// TAGS
// =========================
function adicionarTag(tag) {
  tag = tag.toLowerCase();

  if (tagsSelecionadas.includes(tag)) return;

  tagsSelecionadas.push(tag);

  const container = document.getElementById('filtro-tags');

  const tagEl = document.createElement('div');
  tagEl.className = 'tag';

  tagEl.innerHTML = `
    <span>${tag}</span>
    <button class="tag-remove">✕</button>
  `;

  tagEl.querySelector('.tag-remove').addEventListener('click', (e) => {
    e.stopPropagation();

    tagsSelecionadas = tagsSelecionadas.filter(t => t !== tag);
    tagEl.remove();
    aplicarFiltros();
  });

  container.appendChild(tagEl);

  aplicarFiltros();
}

// =========================
// MODAL
// =========================
const modal = document.createElement('div');
modal.className = 'modal';
document.body.appendChild(modal);

function abrirModal(bar) {
  const horariosHTML = (bar.horarios || [])
    .map(h => `<p>${h.dia}: ${h.abertura} - ${h.fechamento}</p>`)
    .join('');

  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="fecharModal()">✕</button>

      <img src="${bar.imagem}" class="modal-img">

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
          <h4>Horários</h4>
          ${horariosHTML}
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    fecharModal();
  }
});