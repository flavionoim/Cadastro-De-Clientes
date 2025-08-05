const form = document.getElementById('form-cliente');
const tbody = document.getElementById('tabela-clientes-tbody');
const filtro = document.getElementById('filtro');

const iNome = document.getElementById('i-nome');
const iSobrenome = document.getElementById('i-sobrenome');
const iCelular = document.getElementById('i-celular');
const iCep = document.getElementById('i-cep');
const iLogradouro = document.getElementById('i-logradouro');
const iBairro = document.getElementById('i-bairro');
const iCidade = document.getElementById('i-cidade');
const iUf = document.getElementById('i-uf');
const iNumero = document.getElementById('i-numero');

let linhaEditando = null;

// LocalStorage helpers
function getClientesDoStorage() {
  return JSON.parse(localStorage.getItem("clientes")) || [];
}

function salvarClientesNoStorage(clientes) {
  localStorage.setItem("clientes", JSON.stringify(clientes));
}

// CEP lookup
iCep.addEventListener('blur', async () => {
  const cep = iCep.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (data.erro) {
      alert('CEP não encontrado.');
      return;
    }
    iLogradouro.value = data.logradouro || '';
    iBairro.value = data.bairro || '';
    iCidade.value = data.localidade || '';
    iUf.value = data.uf || '';
    iNumero.focus();
  } catch {
    alert('Erro ao buscar o CEP.');
  }
});

// Renderização inicial
function renderTabela(clientes) {
  tbody.innerHTML = '';

  clientes.forEach((cliente, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${cliente.nomeCompleto}</td>
      <td>${cliente.celular}</td>
      <td>${cliente.endereco}</td>
      <td>
        <button class="btn-editar" onclick="editarCliente(${index})">✏️ Editar</button>
        <button class="btn-remover" onclick="removerCliente(${index})">❌ Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Filtro
filtro.addEventListener("input", () => {
  const termo = filtro.value.toLowerCase();
  const clientes = getClientesDoStorage();
  const filtrados = clientes.filter(c => c.nomeCompleto.toLowerCase().includes(termo));
  renderTabela(filtrados);
});

// Formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const cliente = {
    nomeCompleto: `${iNome.value} ${iSobrenome.value}`,
    celular: iCelular.value,
    endereco: `${iLogradouro.value}, ${iNumero.value}, ${iBairro.value}, ${iCidade.value} - ${iUf.value}`
  };

  const clientes = getClientesDoStorage();

  if (linhaEditando !== null) {
    clientes[linhaEditando] = cliente;
    linhaEditando = null;
  } else {
    clientes.push(cliente);
  }

  salvarClientesNoStorage(clientes);
  renderTabela(clientes);
  form.reset();
});

// Editar
function editarCliente(index) {
  const cliente = getClientesDoStorage()[index];
  const nome = cliente.nomeCompleto.split(' ');
  iNome.value = nome.slice(0, -1).join(' ');
  iSobrenome.value = nome.slice(-1)[0];
  iCelular.value = cliente.celular;

  const partes = cliente.endereco.split(', ');
  iLogradouro.value = partes[0] || '';
  iNumero.value = partes[1] || '';
  iBairro.value = partes[2] || '';
  const cidadeUf = partes[3]?.split(' - ') || ['',''];
  iCidade.value = cidadeUf[0] || '';
  iUf.value = cidadeUf[1] || '';

  linhaEditando = index;
}

// Remover
function removerCliente(index) {
  if (confirm("Deseja realmente remover este cliente?")) {
    const clientes = getClientesDoStorage();
    clientes.splice(index, 1);
    salvarClientesNoStorage(clientes);
    renderTabela(clientes);
    form.reset();
    linhaEditando = null;
  }
}

// Carregar ao iniciar
document.addEventListener("DOMContentLoaded", () => {
  renderTabela(getClientesDoStorage());
});
