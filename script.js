const API_URL = "http://localhost:8080/api/tarefas";
const colunasMap = {
    "A_FAZER": document.getElementById("coluna-a-fazer"),
    "EM_ANDAMENTO": document.getElementById("coluna-em-andamento"),
    "CONCLUIDO": document.getElementById("coluna-concluido")
};

function mostrarMensagem(texto, isErro = false) {
    const msgDiv = document.getElementById("statusMsg");
    msgDiv.textContent = texto;
    msgDiv.style.background = isErro ? "#ffebee" : "#e0f7fa";
    msgDiv.style.color = isErro ? "#c62828" : "#01579b";
    msgDiv.classList.add("popup-bounce");
    setTimeout(() => msgDiv.classList.remove("popup-bounce"), 400);
    setTimeout(() => { if (msgDiv.textContent === texto) msgDiv.textContent = ""; }, 3000);
}

async function carregarTarefas() {
    mostrarMensagem("Carregando...");
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const tarefas = await res.json();
        for (let col in colunasMap) colunasMap[col].innerHTML = '';
        tarefas.forEach(tarefa => adicionarCardNaColuna(tarefa));
        mostrarMensagem(`${tarefas.length} tarefa(s) carregada(s).`);
    } catch (err) {
        console.error(err);
        mostrarMensagem("Erro ao conectar com o servidor.", true);
    }
}

function adicionarCardNaColuna(tarefa) {
    const container = colunasMap[tarefa.status];
    if (!container) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', tarefa.id);
    renderizarCardNormal(card, tarefa);
    container.appendChild(card);
    card.classList.add("popup-bounce");
    setTimeout(() => card.classList.remove("popup-bounce"), 300);
}

function renderizarCardNormal(card, tarefa) {
    card.innerHTML = `
        <h4>${escapeHtml(tarefa.titulo)}</h4>
        <p>${escapeHtml(tarefa.descricao || '')}</p>
        <select onchange="mudarStatus(${tarefa.id}, this.value)">
            <option value="A_FAZER" ${tarefa.status === 'A_FAZER' ? 'selected' : ''}>🌊 A Fazer</option>
            <option value="EM_ANDAMENTO" ${tarefa.status === 'EM_ANDAMENTO' ? 'selected' : ''}>🌀 Em Andamento</option>
            <option value="CONCLUIDO" ${tarefa.status === 'CONCLUIDO' ? 'selected' : ''}>✅ Concluído</option>
        </select>
        <div class="card-actions">
            <button class="edit-btn" onclick="iniciarEdicao(this.parentElement.parentElement, ${tarefa.id})">✏️ Editar</button>
            <button class="delete-btn" onclick="deletarTarefa(${tarefa.id})">🗑 Excluir</button>
        </div>
    `;
}

function renderizarCardEditavel(card, tarefa) {
    card.innerHTML = `
        <input type="text" id="edit-titulo-${tarefa.id}" class="edit-mode-input" value="${escapeHtml(tarefa.titulo)}">
        <textarea id="edit-descricao-${tarefa.id}" class="edit-mode-textarea" placeholder="Descrição">${escapeHtml(tarefa.descricao || '')}</textarea>
        <select id="edit-status-${tarefa.id}" class="edit-mode-select">
            <option value="A_FAZER" ${tarefa.status === 'A_FAZER' ? 'selected' : ''}>🌊 A Fazer</option>
            <option value="EM_ANDAMENTO" ${tarefa.status === 'EM_ANDAMENTO' ? 'selected' : ''}>🌀 Em Andamento</option>
            <option value="CONCLUIDO" ${tarefa.status === 'CONCLUIDO' ? 'selected' : ''}>✅ Concluído</option>
        </select>
        <div class="card-actions">
            <button class="save-edit-btn" onclick="salvarEdicao(this.parentElement.parentElement, ${tarefa.id})">💾 Salvar</button>
            <button class="cancel-edit-btn" onclick="cancelarEdicao(this.parentElement.parentElement, ${tarefa.id})">✖ Cancelar</button>
        </div>
    `;
}

async function iniciarEdicao(card, id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error();
        const tarefa = await res.json();
        renderizarCardEditavel(card, tarefa);
    } catch (err) {
        mostrarMensagem("Erro ao carregar dados para edição.", true);
    }
}

async function salvarEdicao(card, id) {
    const novoTitulo = document.getElementById(`edit-titulo-${id}`).value.trim();
    if (!novoTitulo) {
        mostrarMensagem("O título não pode ficar vazio.", true);
        return;
    }
    const novaDescricao = document.getElementById(`edit-descricao-${id}`).value.trim();
    const novoStatus = document.getElementById(`edit-status-${id}`).value;

    const tarefaAtualizada = {
        id: id,
        titulo: novoTitulo,
        descricao: novaDescricao,
        status: novoStatus
    };

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefaAtualizada)
        });
        if (!res.ok) throw new Error();
        await carregarTarefas();
        mostrarMensagem("Tarefa atualizada com sucesso!");
    } catch (err) {
        mostrarMensagem("Erro ao salvar edição.", true);
        await carregarTarefas();
    }
}

async function cancelarEdicao(card, id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error();
        const tarefa = await res.json();
        renderizarCardNormal(card, tarefa);
    } catch (err) {
        mostrarMensagem("Erro ao cancelar edição.", true);
        await carregarTarefas();
    }
}

function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

async function criarTarefa() {
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const status = document.getElementById('status').value;
    if (!titulo) { alert("Título obrigatório!"); return; }
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao, status })
        });
        if (!res.ok) throw new Error();
        document.getElementById('titulo').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('status').value = 'A_FAZER';
        await carregarTarefas();
        mostrarMensagem("Tarefa criada!");
    } catch (err) {
        mostrarMensagem("Erro ao criar tarefa.", true);
    }
}

async function mudarStatus(id, novoStatus) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const tarefa = await res.json();
        tarefa.status = novoStatus;
        const resPut = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tarefa)
        });
        if (!resPut.ok) throw new Error();
        await carregarTarefas();
        mostrarMensagem("Status atualizado!");
    } catch (err) {
        mostrarMensagem("Erro ao mover tarefa.", true);
    }
}

async function deletarTarefa(id) {
    if (!confirm("Excluir esta tarefa?")) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        await carregarTarefas();
        mostrarMensagem("Tarefa excluída!");
    } catch (err) {
        mostrarMensagem("Erro ao excluir.", true);
    }
}

document.getElementById("addBtn").addEventListener("click", () => {
    const btn = document.getElementById("addBtn");
    btn.classList.add("popup-bounce");
    setTimeout(() => btn.classList.remove("popup-bounce"), 300);
    criarTarefa();
});

window.onload = carregarTarefas;