document.addEventListener('DOMContentLoaded', function () {
    const nomeLojaInput = document.getElementById('nomeLoja');
    const valorFixoInput = document.getElementById('valorFixo');
    const btnCadastrar = document.getElementById('btnCadastrar');
    const selectLoja = document.getElementById('selectLoja');
    const quantidadeInput = document.getElementById('quantidade');
    const btnRegistrar = document.getElementById('btnRegistrar');
    const btnResetar = document.getElementById('btnResetar');
    const btnExportar = document.getElementById('btnExportar');
    const listaLojas = document.getElementById('lista-lojas');
    const totalLojasSpan = document.getElementById('total-lojas');
    const totalEntregasSpan = document.getElementById('total-entregas');
    const valorTotalSpan = document.getElementById('valor-total');

    let lojas = JSON.parse(localStorage.getItem('lojas')) || [];
    let totalEntregas = parseInt(localStorage.getItem('totalEntregas')) || 0;
    let valorTotal = parseFloat(localStorage.getItem('valorTotal')) || 0;

    atualizarSelectLojas();
    atualizarListaLojas();
    atualizarResumo();

    btnCadastrar.addEventListener('click', function () {
        const nome = nomeLojaInput.value.trim();
        const valor = parseFloat(valorFixoInput.value);

        if (!nome || isNaN(valor) || valor <= 0) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        if (lojas.some(loja => loja.nome.toLowerCase() === nome.toLowerCase())) {
            alert('Uma loja com esse nome já está cadastrada!');
            return;
        }

        const novaLoja = {
            nome: nome,
            valorFixo: valor,
            entregas: 0,
            total: 0
        };

        lojas.push(novaLoja);
        salvarDados();
        atualizarSelectLojas();
        atualizarListaLojas();
        atualizarResumo();

        nomeLojaInput.value = '';
        valorFixoInput.value = '';
        nomeLojaInput.focus();
    });

    btnRegistrar.addEventListener('click', function () {
        const indiceLoja = selectLoja.selectedIndex - 1;
        const quantidade = parseInt(quantidadeInput.value);

        if (indiceLoja < 0 || indiceLoja >= lojas.length) {
            alert('Por favor, selecione uma loja válida.');
            return;
        }

        if (isNaN(quantidade) || quantidade <= 0) {
            alert('Por favor, insira uma quantidade válida.');
            return;
        }

        const loja = lojas[indiceLoja];
        loja.entregas += quantidade;
        loja.total += quantidade * loja.valorFixo;
        totalEntregas += quantidade;
        valorTotal += quantidade * loja.valorFixo;

        salvarDados();
        atualizarListaLojas();
        atualizarResumo();

        quantidadeInput.value = '1';
    });

    btnResetar.addEventListener('click', function () {
        if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
            lojas = [];
            totalEntregas = 0;
            valorTotal = 0;
            salvarDados();
            atualizarSelectLojas();
            atualizarListaLojas();
            atualizarResumo();
        }
    });

    btnExportar.addEventListener('click', function () {
        if (lojas.length === 0) {
            alert('Não há dados para exportar.');
            return;
        }

        let texto = 'Relatório de Entregas\n\n';
        texto += 'Lojas cadastradas:\n\n';

        lojas.forEach(loja => {
            texto += `${loja.nome}\n`;
            texto += `Valor fixo: R$ ${loja.valorFixo.toFixed(2)}\n`;
            texto += `Entregas realizadas: ${loja.entregas}\n`;
            texto += `Total acumulado: R$ ${loja.total.toFixed(2)}\n\n`;
        });

        texto += '\nResumo Geral:\n';
        texto += `Total de lojas: ${lojas.length}\n`;
        texto += `Total de entregas: ${totalEntregas}\n`;
        texto += `Valor total: R$ ${valorTotal.toFixed(2)}\n`;

        const blob = new Blob([texto], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_entregas_${new Date().toLocaleDateString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    function salvarDados() {
        localStorage.setItem('lojas', JSON.stringify(lojas));
        localStorage.setItem('totalEntregas', totalEntregas.toString());
        localStorage.setItem('valorTotal', valorTotal.toString());
    }

    function atualizarSelectLojas() {
        selectLoja.innerHTML = '<option value="">Selecione uma loja</option>';
        lojas.forEach((loja, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${loja.nome} (R$ ${loja.valorFixo.toFixed(2)})`;
            selectLoja.appendChild(option);
        });
    }

    function atualizarListaLojas() {
        if (lojas.length === 0) {
            listaLojas.innerHTML = '<p class="no-data">Nenhuma loja cadastrada ainda.</p>';
            return;
        }

        listaLojas.innerHTML = '';
        lojas.forEach((loja, index) => {
            const card = document.createElement('div');
            card.className = 'loja-card';
            card.innerHTML = `
                <div class="delete-btn-container">
                    <button class="btn-delete" onclick="deletarLoja(${index})">X</button>
                </div>
                <div class="loja-info">
                    <div class="loja-nome">${loja.nome}</div>
                    <div class="loja-valor">Valor fixo: R$ ${loja.valorFixo.toFixed(2)}</div>
                </div>
                <div class="loja-totais">
                    <div>Entregas: ${loja.entregas}</div>
                    <div>Total: R$ ${loja.total.toFixed(2)}</div>
                </div>
            `;
            listaLojas.appendChild(card);
        });
    }

    function atualizarResumo() {
        totalLojasSpan.textContent = lojas.length;
        totalEntregasSpan.textContent = totalEntregas;
        valorTotalSpan.textContent = `R$ ${valorTotal.toFixed(2)}`;
    }

    // Função para deletar loja
    window.deletarLoja = function(index) {
        if (confirm(`Tem certeza que deseja deletar a loja "${lojas[index].nome}"?`)) {
            totalEntregas -= lojas[index].entregas;
            valorTotal -= lojas[index].total;

            lojas.splice(index, 1);
            salvarDados();
            atualizarSelectLojas();
            atualizarListaLojas();
            atualizarResumo();
        }
    }
});
