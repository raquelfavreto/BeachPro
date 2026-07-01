
let rawData = [];
let globalDuplas = [];
let globalJogadores = [];
let globalJogos = [];
let globalTiposJogo = [];
let globalTorneios = [];

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    setupDropzone();
});

// Configuração Drag and Drop do CSV
function setupDropzone() {
    const dropzone = document.getElementById("dropzone");
    if (!dropzone) return;
    
    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("border-[#D8F22A]");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("border-[#D8F22A]");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-[#D8F22A]");
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].name.endsWith(".csv")) {
            processarFicheiro(files[0]);
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processarFicheiro(file);
    }
}

function processarFicheiro(file) {
    const reader = new FileReader();
    document.getElementById("filename-display").textContent = file.name;
    
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    try {
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) return;

        const headerLine = lines[0];
        const delimiter = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(delimiter).map(h => h.trim().replace(/"/g, ''));

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Simple CSV line parser respecting quotes
            let cols = [];
            let insideQuote = false;
            let currentField = "";
            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                const char = line[charIndex];
                if (char === '"') {
                    insideQuote = !insideQuote;
                } else if (char === delimiter && !insideQuote) {
                    cols.push(currentField.trim());
                    currentField = "";
                } else {
                    currentField += char;
                }
            }
            cols.push(currentField.trim());

            if (cols.length < headers.length) continue;

            const row = {};
            headers.forEach((h, idx) => {
                row[h] = cols[idx] ? cols[idx].replace(/"/g, '') : '';
            });

            // Normalize columns dynamically using aliases if exact headers vary
            const getCol = (keyArray) => {
                for (let k of keyArray) {
                    if (row[k] !== undefined) return row[k];
                }
                return '';
            };

            parsed.push({
                DATA: getCol(["DATA", "data", "Data"]),
                HORÁRIO: getCol(["HORÁRIO", "HORARIO", "horario", "Horário"]),
                JOGO: getCol(["JOGO", "jogo", "Jogo"]),
                "Dupla A": getCol(["Dupla A", "dupla a", "DuplaA", "duplaA"]),
                "Jogador 1 Dupla A": getCol(["Jogador 1 Dupla A", "jogador 1 dupla a", "Jogador 1"]),
                "Jogador 2 Dupla A": getCol(["Jogador 2 Dupla A", "jogador 2 dupla a", "Jogador 2"]),
                "Dupla B": getCol(["Dupla B", "dupla b", "DuplaB", "duplaB"]),
                "Jogador 1 Dupla B": getCol(["Jogador 1 Dupla B", "jogador 1 dupla b"]),
                "Jogador 2 Dupla B": getCol(["Jogador 2 Dupla B", "jogador 2 dupla b"]),
                "TIPO JOGO": getCol(["TIPO JOGO", "tipo jogo", "Tipo Jogo", "TIPO_JOGO"]),
                TORNEIO: getCol(["TORNEIO", "torneio", "Torneio"]),
                QUADRA: getCol(["QUADRA", "quadra", "Quadra"]),
                Game: parseInt(getCol(["Game", "game"]) || 1, 10),
                "Número do Ponto": parseInt(getCol(["Número do Ponto", "Numero do Ponto", "numero do ponto", "Número Ponto"]) || i, 10),
                Tempo: getCol(["Tempo", "tempo"]),
                Rally: parseInt(getCol(["Rally", "rally"]) || 1, 10),
                "Jogador Sacador": getCol(["Jogador Sacador", "jogador sacador", "Sacador"]),
                "Dupla Sacadora": getCol(["Dupla Sacadora", "dupla sacadora", "Dupla sacadora"]),
                "Nome Jogador Ação": getCol(["Nome Jogador Ação", "nome jogador acao", "Nome Jogador Acao", "Jogador Ação"]),
                "Dupla do Jogador Ação": getCol(["Dupla do Jogador Ação", "dupla do jogador acao", "Dupla do Jogador Acao"]),
                "Tipo de Golpe": getCol(["Tipo de Golpe", "tipo de golpe", "Tipo golpe"]),
                "VENCIDO/PERDIDO": getCol(["VENCIDO/PERDIDO", "vencido/perdido", "Vencido/Perdido"]).toUpperCase(),
                "Resumo ponto": getCol(["Resumo ponto", "resumo ponto", "Resumo Ponto"]).toLowerCase(),
                "Detalhe Ponto": getCol(["Detalhe Ponto", "detalhe ponto", "Detalhe ponto"]),
                "Vencedor (Ponto)": getCol(["Vencedor (Ponto)", "vencedor (ponto)", "Vencedor Ponto"]),
                "Game antes A": parseInt(getCol(["Game antes A", "game antes a"]) || 0, 10),
                "Game antes B": parseInt(getCol(["Game antes B", "game antes b"]) || 0, 10),
                "Pontos antes A": getCol(["Pontos antes A", "pontos antes a"]),
                "Pontos antes B": getCol(["Pontos antes B", "pontos antes b"]),
                "Games depois A": parseInt(getCol(["Games depois A", "games depois a"]) || 0, 10),
                "Games depois B": parseInt(getCol(["Games depois B", "games depois b"]) || 0, 10),
                "Pontos depois A": getCol(["Pontos depois A", "pontos depois a"]),
                "Pontos depois B": getCol(["Pontos depois B", "pontos depois b"])
            });
        }

        if (parsed.length > 0) {
            rawData = parsed;
            inicializarDashboard();
        } else {
            alert("A estrutura do arquivo não foi reconhecida. Verifique o padrão de colunas.");
        }

    } catch (err) {
        console.error(err);
        alert("Erro ao processar o seu ficheiro CSV.");
    }
}

function inicializarDashboard() {
    const duplasSet = new Set();
    const jogadoresSet = new Set();
    const jogosSet = new Set();
    const tiposSet = new Set();
    const torneiosSet = new Set();

    rawData.forEach(r => {
        if (r["Dupla A"]) duplasSet.add(r["Dupla A"]);
        if (r["Dupla B"]) duplasSet.add(r["Dupla B"]);
        if (r["Jogador 1 Dupla A"]) jogadoresSet.add(r["Jogador 1 Dupla A"]);
        if (r["Jogador 2 Dupla A"]) jogadoresSet.add(r["Jogador 2 Dupla A"]);
        if (r["Jogador 1 Dupla B"]) jogadoresSet.add(r["Jogador 1 Dupla B"]);
        if (r["Jogador 2 Dupla B"]) jogadoresSet.add(r["Jogador 2 Dupla B"]);
        if (r.JOGO) jogosSet.add(r.JOGO);
        if (r["TIPO JOGO"]) tiposSet.add(r["TIPO JOGO"]);
        if (r.TORNEIO) torneiosSet.add(r.TORNEIO);
    });

    globalDuplas = Array.from(duplasSet).filter(Boolean);
    globalJogadores = Array.from(jogadoresSet).filter(Boolean);
    globalJogos = Array.from(jogosSet).filter(Boolean).sort((a,b) => a.localeCompare(b, undefined, {numeric: true}));
    globalTiposJogo = Array.from(tiposSet).filter(Boolean);
    globalTorneios = Array.from(torneiosSet).filter(Boolean);

    document.getElementById("badge-linhas").textContent = `${rawData.length} lances`;
    document.getElementById("badge-jogos").textContent = `${globalJogos.length} jogos`;

    // Construir mapeamento detalhado dos jogos com número, data e duplas
    const jogosOptions = globalJogos.map(gId => {
        const matchingRow = rawData.find(r => r.JOGO === gId);
        const date = matchingRow ? matchingRow.DATA : '';
        const dA = matchingRow ? matchingRow["Dupla A"] : '';
        const dB = matchingRow ? matchingRow["Dupla B"] : '';
        let dateFormated = date;
        if (date && date.includes('-')) {
            const parts = date.split('-');
            if (parts.length === 3) dateFormated = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return {
            value: gId,
            text: `${gId} - ${dateFormated} (${dA} vs ${dB})`
        };
    });

    alimentarSeletor("s1-filtro-dupla", globalDuplas, true);
    alimentarSeletor("s1-filtro-jogador", globalJogadores);
    alimentarSeletor("s1-filtro-jogo", jogosOptions, false, true);
    alimentarSeletor("s1-filtro-tipojogo", globalTiposJogo);
    alimentarSeletor("s1-filtro-torneio", globalTorneios);

    alimentarSeletor("s2-filtro-dupla", globalDuplas, true);
    alimentarSeletor("s2-filtro-jogo", jogosOptions, false, true);
    alimentarSeletor("s2-filtro-torneio", globalTorneios);

    alimentarSeletor("s3-filtro-jogo", jogosOptions, true, true);

    alimentarSeletor("s4-filtro-jogador", globalJogadores, true);
    alimentarSeletor("s4-filtro-jogo", jogosOptions, false, true);
    alimentarSeletor("s4-filtro-torneio", globalTorneios);

    alimentarSeletor("s5-filtro-dupla", globalDuplas, true);
    alimentarSeletor("s5-filtro-jogo", jogosOptions, false, true);
    alimentarSeletor("s5-filtro-torneio", globalTorneios);

    alimentarSeletor("s6-filtro-jogo", jogosOptions, true, true);

    document.getElementById("pagina-upload").classList.add("hidden");
    document.getElementById("pagina-dashboard").classList.remove("hidden");
    document.getElementById("header-actions").classList.remove("hidden");

    if (globalDuplas.length > 0) {
        document.getElementById("s1-filtro-dupla").value = globalDuplas[0];
        document.getElementById("s2-filtro-dupla").value = globalDuplas[0];
        document.getElementById("s5-filtro-dupla").value = globalDuplas[0];
        atualizarEstatisticasGerais();
        atualizarEstatisticasDupla();
        atualizarEstatisticasPressao();
    }
    if (globalJogos.length > 0) {
        document.getElementById("s3-filtro-jogo").value = globalJogos[0];
        document.getElementById("s6-filtro-jogo").value = globalJogos[0];
        atualizarEstatisticasJogo();
        atualizarSequenciaJogo();
    }
    if (globalJogadores.length > 0) {
        document.getElementById("s4-filtro-jogador").value = globalJogadores[0];
        atualizarEstatisticasIndividual();
    }

    setTimeout(() => { lucide.createIcons(); }, 150);
}

function alimentarSeletor(id, items, addSelectPlaceholder = false, isGameSelector = false) {
    const select = document.getElementById(id);
    select.innerHTML = "";
    
    if (addSelectPlaceholder) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Selecione...";
        select.appendChild(opt);
    } else {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Todos";
        select.appendChild(opt);
    }

    items.forEach(i => {
        const opt = document.createElement("option");
        if (isGameSelector) {
            opt.value = i.value;
            opt.textContent = i.text;
        } else {
            opt.value = i;
            opt.textContent = i;
        }
        select.appendChild(opt);
    });
}

function voltarParaUpload() {
    document.getElementById("pagina-upload").classList.remove("hidden");
    document.getElementById("pagina-dashboard").classList.add("hidden");
    document.getElementById("header-actions").classList.add("hidden");
    rawData = [];
}


// --------------------------------------------------------------------------------------
// CÁLCULOS SECÇÃO 1: GERAIS
// --------------------------------------------------------------------------------------
function atualizarEstatisticasGerais() {
    const duplaSel = document.getElementById("s1-filtro-dupla").value;
    const jogadorSel = document.getElementById("s1-filtro-jogador").value;
    const jogoSel = document.getElementById("s1-filtro-jogo").value;
    const tipoSel = document.getElementById("s1-filtro-tipojogo").value;
    const torneioSel = document.getElementById("s1-filtro-torneio").value;

    const renderDiv = document.getElementById("s1-render");

    if (!duplaSel) {
        renderDiv.innerHTML = `
            <div class="col-span-full py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Por favor, selecione a <strong class="text-white">Dupla Principal *</strong> nos filtros para calcular estatísticas gerais.</p>
            </div>
        `;
        return;
    }

    const filtrados = rawData.filter(r => {
        const matchDupla = (r["Dupla A"] === duplaSel || r["Dupla B"] === duplaSel);
        if (!matchDupla) return false;

        if (jogadorSel) {
            const matchAtleta = (r["Jogador 1 Dupla A"] === jogadorSel || r["Jogador 2 Dupla A"] === jogadorSel || r["Jogador 1 Dupla B"] === jogadorSel || r["Jogador 2 Dupla B"] === jogadorSel);
            if (!matchAtleta) return false;
        }

        if (jogoSel && r.JOGO !== jogoSel) return false;
        if (tipoSel && r["TIPO JOGO"] !== tipoSel) return false;
        if (torneioSel && r.TORNEIO !== torneioSel) return false;

        return true;
    });

    if (filtrados.length === 0) {
        renderDiv.innerHTML = `
            <div class="col-span-full py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Sem lances registados sob os filtros indicados.</p>
            </div>
        `;
        return;
    }

    const matchesSet = new Set(filtrados.map(p => p.JOGO));
    let mWon = 0, mLost = 0;
    let gWon = 0, gLost = 0;
    let ptWon = 0, ptLost = 0;
    let totalRally = 0;

    matchesSet.forEach(gId => {
        const gamePoints = rawData.filter(r => r.JOGO === gId);
        if (gamePoints.length === 0) return;
        const lastPt = gamePoints[gamePoints.length - 1];

        const isDuplaA = lastPt["Dupla A"] === duplaSel;
        const myRole = isDuplaA ? 'A' : 'B';
        const opponentRole = isDuplaA ? 'B' : 'A';

        if (lastPt["Vencedor (Ponto)"] === myRole) mWon++; else mLost++;

        const finalA = lastPt["Games depois A"] || 0;
        const finalB = lastPt["Games depois B"] || 0;

        if (isDuplaA) {
            gWon += finalA; gLost += finalB;
        } else {
            gWon += finalB; gLost += finalA;
        }
    });

    filtrados.forEach(p => {
        totalRally += p.Rally || 0;
        const isDuplaA = p["Dupla A"] === duplaSel;
        const myRole = isDuplaA ? 'A' : 'B';

        if (p["Vencedor (Ponto)"] === myRole) ptWon++; else ptLost++;
    });

    let totalSegundos = 0;
    matchesSet.forEach(gId => {
        const gamePoints = rawData.filter(r => r.JOGO === gId);
        if (gamePoints.length === 0) return;
        const lastPt = gamePoints[gamePoints.length - 1];
        const parts = (lastPt.Tempo || "00:15:00").split(':').map(Number);
        if (parts.length === 3) {
            totalSegundos += parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else {
            totalSegundos += 900;
        }
    });

    const hrs = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const secs = totalSegundos % 60;
    const tempoFormatado = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const mediaRally = (totalRally / filtrados.length).toFixed(1);

    renderDiv.innerHTML = `
        <div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <span class="text-[9px] text-zinc-400 font-bold uppercase block mb-1">Jogos Disputados</span>
            <h4 class="text-3xl font-black text-white">${mWon + mLost}</h4>
            <div class="flex gap-2 mt-2">
                <span class="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">${mWon} V</span>
                <span class="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold">${mLost} D</span>
            </div>
        </div>
        <div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <span class="text-[9px] text-zinc-400 font-bold uppercase block mb-1">Games</span>
            <h4 class="text-3xl font-black text-white">${gWon + gLost}</h4>
            <div class="flex gap-2 mt-2">
                <span class="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">${gWon} V</span>
                <span class="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold">${gLost} D</span>
            </div>
        </div>
        <div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <span class="text-[9px] text-zinc-400 font-bold uppercase block mb-1">Pontos</span>
            <h4 class="text-3xl font-black text-white">${ptWon + ptLost}</h4>
            <div class="flex gap-2 mt-2">
                <span class="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">${ptWon} V</span>
                <span class="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold">${ptLost} D</span>
            </div>
        </div>
        <div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <span class="text-[9px] text-zinc-400 font-bold uppercase block mb-1">Tempo em Quadra</span>
            <h4 class="text-2xl font-black text-cyan-400 mt-1">${tempoFormatado}</h4>
            <span class="text-[8px] text-zinc-500 mt-2 block">Duração total acumulada</span>
        </div>
        <div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <span class="text-[9px] text-zinc-400 font-bold uppercase block mb-1">Média de Rally</span>
            <h4 class="text-3xl font-black text-[#D8F22A]">${mediaRally}</h4>
            <span class="text-[8px] text-zinc-500 mt-2 block">Trocas por rali</span>
        </div>
    `;
}


// --------------------------------------------------------------------------------------
// CÁLCULOS SECÇÃO 2: ESTATÍSTICAS DA DUPLA
// --------------------------------------------------------------------------------------
let globalS2FiltrosData = []; // Buffer de dados filtrados para gráficos dinâmicos de Pizza

function atualizarEstatisticasDupla() {
    const duplaSel = document.getElementById("s2-filtro-dupla").value;
    const jogoSel = document.getElementById("s2-filtro-jogo").value;
    const torneioSel = document.getElementById("s2-filtro-torneio").value;

    const renderDiv = document.getElementById("s2-render");

    if (!duplaSel) {
        renderDiv.innerHTML = `
            <div class="py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Por favor, selecione a <strong class="text-white">Dupla Principal *</strong> para ver o rendimento.</p>
            </div>
        `;
        return;
    }

    const filtrados = rawData.filter(r => {
        const matchDupla = (r["Dupla A"] === duplaSel || r["Dupla B"] === duplaSel);
        if (!matchDupla) return false;
        if (jogoSel && r.JOGO !== jogoSel) return false;
        if (torneioSel && r.TORNEIO !== torneioSel) return false;
        return true;
    });

    globalS2FiltrosData = filtrados; // Salva para gráficos dinâmicos

    if (filtrados.length === 0) {
        renderDiv.innerHTML = `
            <p class="text-xs text-zinc-400 text-center py-6">Sem lances sob estes filtros.</p>
        `;
        return;
    }

    let unforcedWon = 0;
    let forcedWon = 0;
    let winnersWon = 0;

    let unforcedLost = 0;
    let forcedLost = 0;
    let winnersLost = 0;

    let rWonSum = 0, rWonCnt = 0;
    let rLostSum = 0, rLostCnt = 0;

    const rWonRanges = { '1 a 2': 0, '3': 0, '4 a 8': 0, '9 a 12': 0, '13 a 17': 0, '18 ou mais': 0 };
    const rLostRanges = { '1 a 2': 0, '3': 0, '4 a 8': 0, '9 a 12': 0, '13 a 17': 0, '18 ou mais': 0 };

    filtrados.forEach(p => {
        const isDuplaA = p["Dupla A"] === duplaSel;
        const myRole = isDuplaA ? 'A' : 'B';
        const oppRole = isDuplaA ? 'B' : 'A';

        const isWinner = p["Vencedor (Ponto)"] === myRole;
        const isMyAction = p["Dupla do Jogador Ação"] === myRole;
        const isOppAction = p["Dupla do Jogador Ação"] === oppRole;
        const rLower = (p["Resumo ponto"] || '').toLowerCase();

        if (isWinner) {
            rWonSum += p.Rally;
            rWonCnt++;
            if (p.Rally <= 2) rWonRanges['1 a 2']++;
            else if (p.Rally === 3) rWonRanges['3']++;
            else if (p.Rally <= 8) rWonRanges['4 a 8']++;
            else if (p.Rally <= 12) rWonRanges['9 a 12']++;
            else if (p.Rally <= 17) rWonRanges['13 a 17']++;
            else rWonRanges['18 ou mais']++;

            if (rLower === 'erro não forçado' && isOppAction) unforcedWon++;
            if (rLower === 'erro forçado' && isOppAction) forcedWon++;
            if (rLower === 'winner' && isMyAction) winnersWon++;
        } else {
            rLostSum += p.Rally;
            rLostCnt++;
            if (p.Rally <= 2) rLostRanges['1 a 2']++;
            else if (p.Rally === 3) rLostRanges['3']++;
            else if (p.Rally <= 8) rLostRanges['4 a 8']++;
            else if (p.Rally <= 12) rLostRanges['9 a 12']++;
            else if (p.Rally <= 17) rLostRanges['13 a 17']++;
            else rLostRanges['18 ou mais']++;

            if (rLower === 'erro não forçado' && isMyAction) unforcedLost++;
            if (rLower === 'erro forçado' && isMyAction) forcedLost++;
            if (rLower === 'winner' && isOppAction) winnersLost++;
        }
    });

    const rWonAvg = rWonCnt ? (rWonSum / rWonCnt).toFixed(1) : '0.0';
    const rLostAvg = rLostCnt ? (rLostSum / rLostCnt).toFixed(1) : '0.0';

    renderDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Pontos Vencidos -->
            <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background-color: #D8F22A"></span>
                    Pontos vencidos pela dupla selecionada
                </h4>
                <div class="grid grid-cols-3 gap-3">
                    <div class="bg-black p-3 rounded-lg border border-zinc-800 text-center">
                        <span class="text-[8px] text-zinc-400 block mb-1">Erro não Forçado Adv</span>
                        <span class="text-xl font-bold text-white">${unforcedWon}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-800 text-center">
                        <span class="text-[8px] text-zinc-400 block mb-1">Erro Forçado Adv</span>
                        <span class="text-xl font-bold text-white">${forcedWon}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-800 text-center">
                        <span class="text-[8px] text-zinc-400 block mb-1">Winner Dupla</span>
                        <span class="text-xl font-bold text-[#D8F22A]">${winnersWon}</span>
                    </div>
                </div>
            </div>

            <!-- Pontos Perdidos -->
            <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background-color: #ef4444"></span>
                    Pontos perdidos pela dupla selecionada
                </h4>
                <div class="grid grid-cols-3 gap-3">
                    <div class="bg-black p-3 rounded-lg border border-zinc-800 text-center">
                        <span class="text-[8px] text-zinc-400 block mb-1">Erro não Forçado</span>
                        <span class="text-xl font-bold text-white">${unforcedLost}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-800 text-center">
                        <span class="text-[8px] text-zinc-400 block mb-1">Erro Forçado pelo Adv</span>
                        <span class="text-xl font-bold text-white">${forcedLost}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-800 text-center">
                        <span class="text-[8px] text-zinc-400 block mb-1">Winner do Adversário</span>
                        <span class="text-xl font-bold text-red-500">${winnersLost}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráficos de Tipo de Golpe / Ponto Pizza com Filtros Dinâmicos -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
            <div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">Golpe por ponto vencido</h4>
                    <div class="flex gap-2">
                        <select id="s2-golpe-vencido-cat" onchange="renderS2Graficos()" class="bg-black border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1">
                            <option value="normal">Ponto Normal</option>
                            <option value="saque">Saque</option>
                        </select>
                        <select id="s2-golpe-vencido-filtro" onchange="renderS2Graficos()" class="bg-black border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1">
                            <!-- Dinâmico -->
                        </select>
                    </div>
                </div>
                <div id="s2-chart-vencido-render" class="flex flex-col items-center justify-center min-h-[160px]">
                    <!-- SVG render -->
                </div>
            </div>

            <div>
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">Golpe por ponto perdido</h4>
                    <div class="flex gap-2">
                        <select id="s2-golpe-perdido-cat" onchange="renderS2Graficos()" class="bg-black border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1">
                            <option value="normal">Ponto Normal</option>
                            <option value="saque">Saque</option>
                        </select>
                        <select id="s2-golpe-perdido-filtro" onchange="renderS2Graficos()" class="bg-black border border-zinc-800 text-[10px] text-zinc-300 rounded px-2 py-1">
                            <!-- Dinâmico -->
                        </select>
                    </div>
                </div>
                <div id="s2-chart-perdido-render" class="flex flex-col items-center justify-center min-h-[160px]">
                    <!-- SVG render -->
                </div>
            </div>
        </div>

        <!-- Faixas de Rali -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div class="flex justify-between items-baseline mb-4">
                    <span class="text-xs font-bold text-white uppercase">Média Rally: Vencidos</span>
                    <span class="text-2xl font-black text-[#D8F22A]">${rWonAvg} <span class="text-[10px] text-zinc-500">toques</span></span>
                </div>
                <div class="space-y-2.5">
                    ${renderRallyBars(rWonRanges, rWonCnt, "#D8F22A")}
                </div>
            </div>

            <div class="bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
                <div class="flex justify-between items-baseline mb-4">
                    <span class="text-xs font-bold text-white uppercase">Média Rally: Perdidos</span>
                    <span class="text-2xl font-black text-red-500">${rLostAvg} <span class="text-[10px] text-zinc-500">toques</span></span>
                </div>
                <div class="space-y-2.5">
                    ${renderRallyBars(rLostRanges, rLostCnt, "#ef4444")}
                </div>
            </div>
        </div>
    `;

    // Popular opções de Tipo de Golpe para os gráficos de pizza
    popularFiltrosGolpeS2();
    renderS2Graficos();
}

// Renderizador de barras de faixa de rali
function renderRallyBars(ranges, total, colorHex) {
    return Object.entries(ranges).map(([range, count]) => {
        const pct = total ? (count / total) * 100 : 0;
        return `
            <div class="space-y-1">
                <div class="flex justify-between text-[9px] text-zinc-400">
                    <span>${range} toques</span>
                    <span>${count} lances (${Math.round(pct)}%)</span>
                </div>
                <div class="w-full bg-black h-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all" style="width: ${pct}%; background-color: ${colorHex}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function popularFiltrosGolpeS2() {
    const golpesSet = new Set();
    globalS2FiltrosData.forEach(p => {
        if (p["Tipo de Golpe"]) golpesSet.add(p["Tipo de Golpe"]);
    });
    const golpes = Array.from(golpesSet).filter(Boolean);

    const sVencido = document.getElementById("s2-golpe-vencido-filtro");
    const sPerdido = document.getElementById("s2-golpe-perdido-filtro");

    const populate = (el) => {
        el.innerHTML = '<option value="">Filtrar Golpe (Todos)</option>';
        golpes.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            el.appendChild(opt);
        });
    };

    populate(sVencido);
    populate(sPerdido);
}

function renderS2Graficos() {
    const duplaSel = document.getElementById("s2-filtro-dupla").value;
    const catVencido = document.getElementById("s2-golpe-vencido-cat").value;
    const filtroVencido = document.getElementById("s2-golpe-vencido-filtro").value;

    const catPerdido = document.getElementById("s2-golpe-perdido-cat").value;
    const filtroPerdido = document.getElementById("s2-golpe-perdido-filtro").value;

    const drawPizza = (containerId, isWonSide, category, strokeFilter) => {
        const container = document.getElementById(containerId);
        
        // Filtrar os lances relativos à dupla e se venceram/perderam
        const data = globalS2FiltrosData.filter(p => {
            const isDuplaA = p["Dupla A"] === duplaSel;
            const myRole = isDuplaA ? 'A' : 'B';
            const isWinner = p["Vencedor (Ponto)"] === myRole;
            if (isWinner !== isWonSide) return false;

            if (strokeFilter && p["Tipo de Golpe"] !== strokeFilter) return false;
            return true;
        });

        // Chaves de agregação segundo a categoria
        let counts = {};
        let keys = [];
        if (category === 'normal') {
            keys = ["winner", "erro forçado", "erro não forçado"];
        } else {
            keys = ["ace", "saque na rede", "saque para fora", "saque devolvido"];
        }
        keys.forEach(k => counts[k] = 0);

        data.forEach(p => {
            const res = (p["Resumo ponto"] || '').toLowerCase();
            const det = (p["Detalhe Ponto"] || '').toLowerCase();
            const g = (p["Tipo de Golpe"] || '').toLowerCase();

            if (category === 'normal') {
                if (res === 'winner') counts["winner"]++;
                else if (res === 'erro forçado') counts["erro forçado"]++;
                else if (res === 'erro não forçado') counts["erro não forçado"]++;
            } else {
                if (res === 'ace') counts["ace"]++;
                else if (res.includes('saque') && res.includes('erro') && det === 'rede') counts["saque na rede"]++;
                else if (res.includes('saque') && res.includes('erro') && (det === 'rede' || det.includes('fora'))) counts["saque para fora"]++;
                else if (g.includes('devolu') || res.includes('devolu')) counts["saque devolvido"]++;
            }
        });

        const total = Object.values(counts).reduce((a, b) => a + b, 0);

        if (total === 0) {
            container.innerHTML = `<span class="text-[10px] text-zinc-500 py-10">Sem registos para o golpe selecionado</span>`;
            return;
        }

        // Desenhar tabela visual e barra horizontal acumulada
        let colors = {
            "winner": "#D8F22A",
            "erro forçado": "#F59E0B",
            "erro não forçado": "#EF4444",
            "ace": "#10B981",
            "saque na rede": "#EF4444",
            "saque para fora": "#F59E0B",
            "saque devolvido": "#3B82F6"
        };

        let listHTML = Object.entries(counts).map(([k, val]) => {
            const pct = total ? Math.round((val / total) * 100) : 0;
            const col = colors[k] || "#fff";
            return `
                <div class="flex items-center justify-between text-[11px] py-1 border-b border-zinc-850/50">
                    <span class="flex items-center gap-1.5 text-zinc-300">
                        <span class="w-2 h-2 rounded-full" style="background-color: ${col}"></span>
                        <span class="capitalize">${k}</span>
                    </span>
                    <span class="font-bold text-white">${val} <span class="text-zinc-500 font-normal">(${pct}%)</span></span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="w-full space-y-3">
                <div class="h-3 w-full bg-black rounded-full overflow-hidden flex">
                    ${Object.entries(counts).map(([k, val]) => {
                        const pct = (val / total) * 100;
                        const col = colors[k] || "#fff";
                        return val > 0 ? `<div style="width: ${pct}%; background-color: ${col}" class="h-full"></div>` : '';
                    }).join('')}
                </div>
                <div class="space-y-1">
                    ${listHTML}
                </div>
            </div>
        `;
    };

    drawPizza("s2-chart-vencido-render", true, catVencido, filtroVencido);
    drawPizza("s2-chart-perdido-render", false, catPerdido, filtroPerdido);
}


// --------------------------------------------------------------------------------------
// CÁLCULOS SECÇÃO 3: VERSUS (JOGO)
// --------------------------------------------------------------------------------------
function atualizarEstatisticasJogo() {
    const jogoSel = document.getElementById("s3-filtro-jogo").value;
    const renderDiv = document.getElementById("s3-render");

    if (!jogoSel) {
        renderDiv.innerHTML = `
            <div class="py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Selecione o <strong class="text-white">Jogo *</strong> para visualizar as barras borboleta.</p>
            </div>
        `;
        return;
    }

    const gamePoints = rawData.filter(r => r.JOGO === jogoSel);
    if (gamePoints.length === 0) {
        renderDiv.innerHTML = `<p class="text-xs text-center text-zinc-500">Jogo não encontrado.</p>`;
        return;
    }

    const dA = gamePoints[0]["Dupla A"];
    const dB = gamePoints[0]["Dupla B"];

    let pLostA = 0; let pLostB = 0;
    let pWonA = 0; let pWonB = 0;
    let wA = 0; let wB = 0;
    let devWA = 0; let devWB = 0;
    let efA = 0; let efB = 0;
    let enfA = 0; let enfB = 0;
    let acA = 0; let acB = 0;
    let devErrA = 0; let devErrB = 0;
    let bpWonA = 0; let bpWonB = 0;
    let heldA = 0; let heldB = 0;

    gamePoints.forEach(p => {
        const isWinnerA = p["Vencedor (Ponto)"] === 'A';
        const isWinnerB = p["Vencedor (Ponto)"] === 'B';
        const isAcaoA = p["Dupla do Jogador Ação"] === 'A';
        const isAcaoB = p["Dupla do Jogador Ação"] === 'B';
        const golpeLower = (p["Tipo de Golpe"] || '').toLowerCase();
        const resLower = (p["Resumo ponto"] || '').toLowerCase();

        if (isWinnerA) { pWonA++; pLostB++; }
        if (isWinnerB) { pWonB++; pLostA++; }

        if (resLower === 'winner') {
            if (isAcaoA) wA++;
            if (isAcaoB) wB++;

            if (golpeLower.includes('devolução') || golpeLower.includes('devolucao')) {
                if (isAcaoA) devWA++;
                if (isAcaoB) devWB++;
            }
        }

        if (resLower === 'erro forçado') {
            if (isAcaoA) efA++;
            if (isAcaoB) efB++;
        }

        if (resLower === 'erro não forçado') {
            if (isAcaoA) enfA++;
            if (isAcaoB) enfB++;
        }

        if (resLower === 'ace') {
            if (isAcaoA) acA++;
            if (isAcaoB) acB++;
        }

        if (resLower.includes('devolução') && resLower.includes('erro')) {
            if (isAcaoA) devErrA++;
            if (isAcaoB) devErrB++;
        }

        const isBP = (p["Pontos antes A"] === '40' || p["Pontos antes B"] === '40' || p["Pontos antes A"] === 'Ad' || p["Pontos antes B"] === 'Ad');
        if (isBP) {
            if (p["Dupla Sacadora"] === 'A' && isWinnerB) bpWonB++;
            if (p["Dupla Sacadora"] === 'B' && isWinnerA) bpWonA++;
        }

        const isGameEnd = p["Games depois A"] > p["Game antes A"] || p["Games depois B"] > p["Game antes B"];
        if (isGameEnd) {
            const gameWinner = p["Games depois A"] > p["Game antes A"] ? 'A' : 'B';
            if (p["Dupla Sacadora"] === gameWinner) {
                if (gameWinner === 'A') heldA++; else heldB++;
            }
        }
    });

    const metrics = [
        { label: "Quantidade de pontos perdidos", valA: pLostA, valB: pLostB },
        { label: "Quantidade de pontos vencidos", valA: pWonA, valB: pWonB },
        { label: "Quantidade de winners", valA: wA, valB: wB },
        { label: "Winners de Devolução", valA: devWA, valB: devWB },
        { label: "Quantidade de pontos de erro forçado", valA: efA, valB: efB },
        { label: "Quantidade de pontos de erro não forçado", valA: enfA, valB: enfB },
        { label: "Aces convertidos", valA: acA, valB: acB },
        { label: "Erros de Devolução", valA: devErrA, valB: devErrB },
        { label: "Breakpoints Vencidos", valA: bpWonA, valB: bpWonB },
        { label: "Jogos de Serviço Confirmados (Holds)", valA: heldA, valB: heldB }
    ];

    let metricsHTML = metrics.map(m => {
        const max = Math.max(m.valA, m.valB, 1);
        const pctA = (m.valA / max) * 100;
        const pctB = (m.valB / max) * 100;

        return `
            <div class="space-y-1">
                <div class="text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400">${m.label}</div>
                <div class="grid grid-cols-12 items-center gap-4">
                    <div class="col-span-5 flex items-center gap-2 justify-end">
                        <span class="text-xs font-bold text-white">${m.valA}</span>
                        <div class="w-full bg-black h-2.5 rounded-full flex justify-end overflow-hidden">
                            <div class="bg-[#D8F22A] h-full rounded-full transition-all" style="width: ${pctA}%"></div>
                        </div>
                    </div>
                    <div class="col-span-2 text-center">
                        <span class="text-[8px] bg-zinc-800 text-zinc-500 font-bold px-1.5 py-0.5 rounded border border-zinc-700">VS</span>
                    </div>
                    <div class="col-span-5 flex items-center gap-2">
                        <div class="w-full bg-black h-2.5 rounded-full overflow-hidden">
                            <div class="bg-cyan-400 h-full rounded-full transition-all" style="width: ${pctB}%"></div>
                        </div>
                        <span class="text-xs font-bold text-white">${m.valB}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    renderDiv.innerHTML = `
        <div class="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
            <div class="flex justify-between items-center text-xs font-black border-b border-zinc-800 pb-3">
                <span class="text-[#D8F22A] flex items-center gap-1.5"><i data-lucide="users" class="w-3.5 h-3.5"></i> ${dA}</span>
                <span class="text-zinc-500 uppercase tracking-widest text-[8px]">Métricas do Jogo Selecionado</span>
                <span class="text-cyan-400 flex items-center gap-1.5">${dB} <i data-lucide="users" class="w-3.5 h-3.5"></i></span>
            </div>
            <div class="space-y-4">
                ${metricsHTML}
            </div>
        </div>
    `;
    lucide.createIcons();
}


// --------------------------------------------------------------------------------------
// CÁLCULOS SECÇÃO 4 & 5: INDIVIDUAL
// --------------------------------------------------------------------------------------
function atualizarEstatisticasIndividual() {
    const atletaSel = document.getElementById("s4-filtro-jogador").value;
    const juegoSel = document.getElementById("s4-filtro-jogo").value;
    const torneioSel = document.getElementById("s4-filtro-torneio").value;

    const renderDiv = document.getElementById("s4-render");

    if (!atletaSel) {
        renderDiv.innerHTML = `
            <div class="py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Selecione o <strong class="text-white">Jogador *</strong> para visualizar estatísticas individuais.</p>
            </div>
        `;
        return;
    }

    const filtrados = rawData.filter(r => {
        const matchAtleta = r["Nome Jogador Ação"] === atletaSel || r["Jogador Sacador"] === atletaSel;
        if (!matchAtleta) return false;
        if (juegoSel && r.JOGO !== juegoSel) return false;
        if (torneioSel && r.TORNEIO !== torneioSel) return false;
        return true;
    });

    if (filtrados.length === 0) {
        renderDiv.innerHTML = `<p class="text-xs text-zinc-500 text-center py-6">Sem lances registados para este atleta.</p>`;
        return;
    }

    let saquesTotal = 0;
    let saqueRede = 0;
    let saqueFora = 0;
    let aces = 0;
    let devWinnerAdv = 0;
    let devErroAdv = 0;
    let vencidos3bola = 0;

    const strokesMap = {}; 

    let enfRede = 0, enfFora = 0;
    let efRede = 0, efFora = 0;
    let devRede = 0, devFora = 0;

    filtrados.forEach(p => {
        const isServer = p["Jogador Sacador"] === atletaSel;
        const isActor = p["Nome Jogador Ação"] === atletaSel;
        const resLower = (p["Resumo ponto"] || '').toLowerCase();
        const detLower = (p["Detalhe Ponto"] || '').toLowerCase();
        const golpe = p["Tipo de Golpe"] || 'Outro';

        if (isServer) {
            saquesTotal++;
            if (resLower === 'ace') aces++;
            if (resLower.includes('saque') && resLower.includes('erro')) {
                if (detLower === 'rede') saqueRede++; else saqueFora++;
            }

            if (resLower === 'winner' && golpe.toLowerCase().includes('devolu') && p["Dupla do Jogador Ação"] !== p["Dupla Sacadora"]) {
                devWinnerAdv++;
            }

            if (resLower.includes('devolu') && resLower.includes('erro') && p["Dupla do Jogador Ação"] !== p["Dupla Sacadora"]) {
                devErroAdv++;
            }

            if (p.Rally === 3 && p["Vencedor (Ponto)"] === p["Dupla Sacadora"]) {
                vencidos3bola++;
            }
        }

        if (isActor) {
            if (!strokesMap[golpe]) strokesMap[golpe] = { w: 0, ef: 0, enf: 0 };
            
            if (resLower === 'winner') {
                strokesMap[golpe].w++;
            } else if (resLower === 'erro não forçado') {
                strokesMap[golpe].enf++;
                if (detLower.includes('rede')) enfRede++; else enfFora++;
            } else if (resLower === 'erro forçado') {
                strokesMap[golpe].ef++;
                if (detLower.includes('rede')) efRede++; else efFora++;
            }

            if (resLower.includes('devolu') && resLower.includes('erro')) {
                if (detLower === 'rede') devRede++; else devFora++;
            }
        }
    });

    const saquesAcertos = saquesTotal - (saqueRede + saqueFora);
    const saquesPct = saquesTotal ? Math.round((saquesAcertos / saquesTotal) * 100) : 0;

    // Encontrar o maior total de golpes para escala de largura das barras
    let maxStrokeCount = 1;
    Object.values(strokesMap).forEach(counts => {
        const sum = counts.w + counts.ef + counts.enf;
        if (sum > maxStrokeCount) maxStrokeCount = sum;
    });

    let golpesHTML = "";
    const golpesArray = Object.entries(strokesMap);
    if (golpesArray.length === 0) {
        golpesHTML = `<p class="text-xs text-zinc-500 text-center py-6">Sem estatísticas de golpes registadas.</p>`;
    } else {
        golpesHTML = `
            <div class="flex flex-wrap gap-4 mb-4 text-[10px] text-zinc-400 border-b border-zinc-800 pb-3">
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-[#D8F22A] rounded-sm"></span> Winners</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span> Erros Forçados</span>
                <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-red-500 rounded-sm"></span> Erros Não Forçados</span>
            </div>
            <div class="space-y-4">
                ${golpesArray.map(([gName, count]) => {
                    const total = count.w + count.ef + count.enf || 1;
                    const containerPct = (total / maxStrokeCount) * 100;
                    const pctW = (count.w / total) * 100;
                    const pctEf = (count.ef / total) * 100;
                    const pctEnf = (count.enf / total) * 100;

                    return `
                        <div class="space-y-1 text-xs">
                            <div class="flex justify-between font-bold text-zinc-300">
                                <span>${gName}</span>
                                <span class="text-[9px] text-zinc-500">Total: ${total}</span>
                            </div>
                            <div class="w-full bg-black/40 h-4 rounded overflow-hidden">
                                <div class="h-full rounded flex transition-all" style="width: ${containerPct}%">
                                    ${count.w > 0 ? `<div class="bg-[#D8F22A] h-full text-[8px] font-black text-black flex items-center justify-center" style="width: ${pctW}%" title="Winners">W:${count.w}</div>` : ''}
                                    ${count.ef > 0 ? `<div class="bg-amber-500 h-full text-[8px] font-black text-black flex items-center justify-center" style="width: ${pctEf}%" title="Erros Forçados">EF:${count.ef}</div>` : ''}
                                    ${count.enf > 0 ? `<div class="bg-red-500 h-full text-[8px] font-black text-white flex items-center justify-center" style="width: ${pctEnf}%" title="Erros Não Forçados">ENF:${count.enf}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    const totalRede = enfRede + efRede + devRede;
    const totalFora = enfFora + efFora + devFora;
    const totalErros = totalRede + totalFora;
    const redePct = totalErros ? (totalRede / totalErros) * 100 : 0;
    const foraPct = totalErros ? (totalFora / totalErros) * 100 : 0;

    renderDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Painel Saque -->
            <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between text-center">
                <div>
                    <span class="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Aproveitamento de Saque</span>
                    <p class="text-[9px] text-zinc-500 mb-4">${atletaSel} ao serviço</p>
                </div>
                
                <div class="relative inline-flex items-center justify-center mx-auto mb-4">
                    <svg class="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#18181b" stroke-width="6"></circle>
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#D8F22A" stroke-width="6"
                                stroke-dasharray="${2 * Math.PI * 40}"
                                stroke-dashoffset="${2 * Math.PI * 40 * (1 - saquesPct / 100)}"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="text-2xl font-black text-white">${saquesPct}%</span>
                        <span class="text-[8px] text-zinc-500 uppercase">Eficiência</span>
                    </div>
                </div>

                <div class="flex justify-around text-xs bg-black p-2 rounded-lg border border-zinc-850">
                    <div>
                        <span class="text-[8px] text-zinc-400 block">Acertos</span>
                        <strong class="text-white">${saquesAcertos}</strong>
                    </div>
                    <div class="border-r border-zinc-800"></div>
                    <div>
                        <span class="text-[8px] text-zinc-400 block">Erros</span>
                        <strong class="text-white">${saqueRede + saqueFora}</strong>
                    </div>
                </div>
            </div>

            <!-- Métricas Detalhadas Saque -->
            <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 md:col-span-2 flex flex-col justify-between">
                <div>
                    <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-2">Comportamento do Serviço</h4>
                    <p class="text-[9px] text-zinc-500 mb-4">Frequência e eficiência técnica do saque</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div class="bg-black p-3 rounded-lg border border-zinc-850">
                        <span class="text-[9px] text-zinc-400 block mb-1">Erros na Rede</span>
                        <span class="text-base font-bold text-white">${saqueRede}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850">
                        <span class="text-[9px] text-zinc-400 block mb-1">Erros Para Fora</span>
                        <span class="text-base font-bold text-white">${saqueFora}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850">
                        <span class="text-[9px] text-zinc-400 block mb-1">Aces Conquistados</span>
                        <span class="text-base font-bold text-emerald-400">${aces}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850">
                        <span class="text-[9px] text-zinc-400 block mb-1">Winner Devol. Adv</span>
                        <span class="text-base font-bold text-white">${devWinnerAdv}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850">
                        <span class="text-[9px] text-zinc-400 block mb-1">Erro Devol. Adv</span>
                        <span class="text-base font-bold text-[#D8F22A]">${devErroAdv}</span>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850">
                        <span class="text-[9px] text-zinc-400 block mb-1">Vencidos 3ª Bola</span>
                        <span class="text-base font-bold text-cyan-400">${vencidos3bola}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Estatísticas de Tipo de Golpe e Localização de Erros -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 md:col-span-2">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-4">Aproveitamento por Tipo de Golpe</h4>
                <div class="space-y-4">
                    ${golpesHTML}
                </div>
            </div>

            <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-4">
                <h4 class="text-xs font-bold text-white uppercase tracking-wider">Erros na Rede vs Fora</h4>
                
                <!-- Donut Chart de Erros -->
                <div class="flex flex-col items-center justify-center py-2 border-b border-zinc-800 pb-4">
                    <div class="relative w-28 h-28 shrink-0">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#18181b" stroke-width="4.5"></circle>
                            ${totalRede > 0 ? `
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" stroke-width="4.5"
                                    stroke-dasharray="${redePct} ${100 - redePct}"
                                    stroke-dashoffset="100"></circle>
                            ` : ''}
                            ${totalFora > 0 ? `
                            <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" stroke-width="4.5"
                                    stroke-dasharray="${foraPct} ${100 - foraPct}"
                                    stroke-dashoffset="${100 - redePct}"></circle>
                            ` : ''}
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="text-[8px] text-zinc-500 uppercase">Erros</span>
                            <span class="text-base font-black text-white">${totalErros}</span>
                        </div>
                    </div>
                    <div class="flex justify-center gap-4 mt-4 w-full text-[10px]">
                        <div class="flex items-center gap-1.5 text-zinc-300">
                            <span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                            <span>Na Rede: ${totalRede} (${Math.round(redePct)}%)</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-zinc-300">
                            <span class="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                            <span>Fora: ${totalFora} (${Math.round(foraPct)}%)</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="bg-black p-3 rounded-lg border border-zinc-850 flex justify-between items-center text-xs">
                        <div>
                            <strong class="text-zinc-300 block">Não Forçados</strong>
                            <span class="text-[9px] text-zinc-500">Total: ${enfRede + enfFora}</span>
                        </div>
                        <div class="flex gap-1.5 text-[9px]">
                            <span class="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">Rede: ${enfRede}</span>
                            <span class="bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded">Fora: ${enfFora}</span>
                        </div>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850 flex justify-between items-center text-xs">
                        <div>
                            <strong class="text-zinc-300 block">Forçados</strong>
                            <span class="text-[9px] text-zinc-500">Total: ${efRede + efFora}</span>
                        </div>
                        <div class="flex gap-1.5 text-[9px]">
                            <span class="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">Rede: ${efRede}</span>
                            <span class="bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded">Fora: ${efFora}</span>
                        </div>
                    </div>
                    <div class="bg-black p-3 rounded-lg border border-zinc-850 flex justify-between items-center text-xs">
                        <div>
                            <strong class="text-zinc-300 block">Devoluções</strong>
                            <span class="text-[9px] text-zinc-500">Total: ${devRede + devFora}</span>
                        </div>
                        <div class="flex gap-1.5 text-[9px]">
                            <span class="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">Rede: ${devRede}</span>
                            <span class="bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded">Fora: ${devFora}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


// --------------------------------------------------------------------------------------
// CÁLCULOS SECÇÃO 6: PONTOS IMPORTANTES
// --------------------------------------------------------------------------------------
const memoriaPressao = {}; 

function atualizarEstatisticasPressao() {
    const duplaSel = document.getElementById("s5-filtro-dupla").value;
    const jogoSel = document.getElementById("s5-filtro-jogo").value;
    const torneioSel = document.getElementById("s5-filtro-torneio").value;

    const renderDiv = document.getElementById("s5-render");

    if (!duplaSel) {
        renderDiv.innerHTML = `
            <div class="py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Por favor, selecione a <strong class="text-white">Dupla Selecionada *</strong> para ver pontos importantes.</p>
            </div>
        `;
        return;
    }

    const filtrados = rawData.filter(r => {
        const matchDupla = (r["Dupla A"] === duplaSel || r["Dupla B"] === duplaSel);
        if (!matchDupla) return false;
        if (jogoSel && r.JOGO !== jogoSel) return false;
        if (torneioSel && r.TORNEIO !== torneioSel) return false;
        return true;
    });

    if (filtrados.length === 0) {
        renderDiv.innerHTML = `<p class="text-xs text-zinc-500 text-center py-6">Sem lances registados para este filtro.</p>`;
        return;
    }

    const cat = {
        p30x30_won: [], p30x30_lost: [],
        p40x40_won: [], p40x40_lost: [],
        holds: [], holds_opp: [],
        bp_won: [], bp_lost: [],
        bp_contra_won: [], bp_contra_lost: [],
        mp_disputados: [], mp_vencidos: [],
        comebacks_won: [], comebacks_lost: []
    };

    const comebacksTracker = {}; 

    filtrados.forEach(p => {
        const isDuplaA = p["Dupla A"] === duplaSel;
        const myRole = isDuplaA ? 'A' : 'B';
        const oppRole = isDuplaA ? 'B' : 'A';

        const isWinner = p["Vencedor (Ponto)"] === myRole;
        const isServer = p["Dupla Sacadora"] === myRole;

        const ptsA = p["Pontos antes A"];
        const ptsB = p["Pontos antes B"];
        const myPts = isDuplaA ? ptsA : ptsB;
        const oppPts = isDuplaA ? ptsB : ptsA;

        const gA_antes = p["Game antes A"];
        const gB_antes = p["Game antes B"];
        const gA_depois = p["Games depois A"];
        const gB_depois = p["Games depois B"];

        const myG_antes = isDuplaA ? gA_antes : gB_antes;
        const oppG_antes = isDuplaA ? gB_antes : gA_antes;

        // 30x30
        if (ptsA === "30" && ptsB === "30") {
            if (isWinner) cat.p30x30_won.push(p); else cat.p30x30_lost.push(p);
        }

        // 40x40 (Golden Point)
        if (ptsA === "40" && ptsB === "40") {
            if (isWinner) cat.p40x40_won.push(p); else cat.p40x40_lost.push(p);
        }

        // Holds / Confirmações de Serviço
        const endedGame = (gA_depois > gA_antes) || (gB_depois > gB_antes);
        if (endedGame) {
            const gameWinnerRole = (gA_depois > gA_antes) ? 'A' : 'B';
            const isDuplaWinner = gameWinnerRole === myRole;

            if (isServer) {
                if (isDuplaWinner) cat.holds.push(p);
            } else {
                if (!isDuplaWinner) cat.holds_opp.push(p);
            }
        }

        // Breakpoints a Favor (Dupla adversária a sacar e nós temos chance de fechar o game)
        const isAdvServing = p["Dupla Sacadora"] === oppRole;
        const isReceiverAt40 = (oppPts === "40" || oppPts === "Ad") ? false : (myPts === "40" || myPts === "Ad");
        if (isAdvServing && isReceiverAt40) {
            if (isWinner) cat.bp_won.push(p); else cat.bp_lost.push(p);
        }

        // Breakpoints Contra (Nós a sacar e adversário com chance de quebrar)
        const isServerAt40 = (myPts === "40" || myPts === "Ad") ? false : (oppPts === "40" || oppPts === "Ad");
        if (isServer && isServerAt40) {
            if (isWinner) cat.bp_contra_won.push(p); else cat.bp_contra_lost.push(p);
        }

        // Matchpoints (Disputados e Vencidos)
        const isMatchPointOpportunity = (myG_antes >= 5 && myG_antes > oppG_antes) && (myPts === "40" || myPts === "Ad");

        if (isMatchPointOpportunity) {
            cat.mp_disputados.push(p);
            if (isWinner) cat.mp_vencidos.push(p);
        }

        // Viradas (Comebacks): Acumular os pontos para análise de histórico do game
        const key = `${p.JOGO}-${p.Game}`;
        if (!comebacksTracker[key]) comebacksTracker[key] = [];
        comebacksTracker[key].push({ point: p, myPts, oppPts, isWinner });
    });

    // Processamento das viradas de Game
    Object.entries(comebacksTracker).forEach(([gameKey, ptsList]) => {
        let reached0x40 = false;
        let reached40x0 = false;
        
        ptsList.forEach(pt => {
            if (pt.myPts === "0" && pt.oppPts === "40") reached0x40 = true;
            if (pt.myPts === "40" && pt.oppPts === "0") reached40x0 = true;
        });

        const lastPt = ptsList[ptsList.length - 1].point;
        const isDuplaA = lastPt["Dupla A"] === duplaSel;
        const myRole = isDuplaA ? 'A' : 'B';
        
        const gameWinnerRole = (lastPt["Games depois A"] > lastPt["Game antes A"]) ? 'A' : 'B';
        const wonGame = gameWinnerRole === myRole;

        if (reached0x40 && wonGame) {
            cat.comebacks_won.push(lastPt); // Recuperou de 0x40 e venceu
        }
        if (reached40x0 && !wonGame) {
            cat.comebacks_lost.push(lastPt); // Estava 40x0 e perdeu o game
        }
    });

    memoriaPressao["p30x30_won"] = cat.p30x30_won;
    memoriaPressao["p30x30_lost"] = cat.p30x30_lost;
    memoriaPressao["p40x40_won"] = cat.p40x40_won;
    memoriaPressao["p40x40_lost"] = cat.p40x40_lost;
    memoriaPressao["holds"] = cat.holds;
    memoriaPressao["holds_opp"] = cat.holds_opp;
    memoriaPressao["bp_won"] = cat.bp_won;
    memoriaPressao["bp_lost"] = cat.bp_lost;
    memoriaPressao["bp_contra_won"] = cat.bp_contra_won;
    memoriaPressao["bp_contra_lost"] = cat.bp_contra_lost;
    memoriaPressao["mp_disputados"] = cat.mp_disputados;
    memoriaPressao["mp_vencidos"] = cat.mp_vencidos;
    memoriaPressao["comebacks_won"] = cat.comebacks_won;
    memoriaPressao["comebacks_lost"] = cat.comebacks_lost;

    const itens = [
        { label: "Pontos 30x30 Vencidos", key: "p30x30_won", list: cat.p30x30_won, color: "from-yellow-400 to-yellow-600" },
        { label: "Pontos 30x30 Perdidos", key: "p30x30_lost", list: cat.p30x30_lost, color: "from-red-500 to-red-700" },
        { label: "Pontos 40x40 (Golden Point) Vencidos", key: "p40x40_won", list: cat.p40x40_won, color: "from-cyan-400 to-cyan-600" },
        { label: "Pontos 40x40 (Golden Point) Perdidos", key: "p40x40_lost", list: cat.p40x40_lost, color: "from-rose-500 to-rose-700" },
        { label: "Games de Serviço Confirmados", key: "holds", list: cat.holds, color: "from-emerald-400 to-emerald-600" },
        { label: "Games de Serviço Confirmados pelo Adv", key: "holds_opp", list: cat.holds_opp, color: "from-orange-500 to-orange-700" },
        { label: "Breakpoints a Favor Vencidos", key: "bp_won", list: cat.bp_won, color: "from-blue-400 to-indigo-600" },
        { label: "Breakpoints a Favor Perdidos", key: "bp_lost", list: cat.bp_lost, color: "from-purple-500 to-pink-700" },
        { label: "Breakpoints Contra Salvos", key: "bp_contra_won", list: cat.bp_contra_won, color: "from-teal-400 to-teal-600" },
        { label: "Breakpoints Contra Perdidos", key: "bp_contra_lost", list: cat.bp_contra_lost, color: "from-amber-600 to-amber-800" },
        { label: "Matchpoints Disputados", key: "mp_disputados", list: cat.mp_disputados, color: "from-fuchsia-500 to-fuchsia-700" },
        { label: "Matchpoints Vencidos", key: "mp_vencidos", list: cat.mp_vencidos, color: "from-violet-500 to-violet-700" },
        { label: "Viradas de Game a Favor (0x40 para Win)", key: "comebacks_won", list: cat.comebacks_won, color: "from-green-400 to-green-600" },
        { label: "Viradas de Game Sofridas (40x0 para Lose)", key: "comebacks_lost", list: cat.comebacks_lost, color: "from-red-700 to-red-900" }
    ];

    renderDiv.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${itens.map(i => {
                const maxVal = Math.max(...itens.map(it => it.list.length), 1);
                const pct = (i.list.length / maxVal) * 100;
                return `
                    <div onclick="abrirModalPontos('${i.label}', '${i.key}')" 
                            class="bg-zinc-900 hover:bg-zinc-850 p-4 rounded-xl border border-zinc-800 hover:border-[#D8F22A] cursor-pointer transition-all group flex flex-col justify-between">
                        <div class="flex justify-between items-start mb-2 text-xs">
                            <span class="text-zinc-300 group-hover:text-white font-bold leading-tight">${i.label}</span>
                            <span class="bg-black text-white px-2 py-0.5 rounded text-[10px] border border-zinc-800 font-black">${i.list.length}</span>
                        </div>
                        <div class="w-full bg-black h-1.5 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r ${i.color}" style="width: ${pct}%"></div>
                        </div>
                        <span class="text-[8px] text-zinc-500 block mt-2 text-right">Clique para mais detalhes</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}


// --------------------------------------------------------------------------------------
// CÁLCULOS SECÇÃO 7: SEQUÊNCIA DE JOGO (Linha do Tempo Completa)
// --------------------------------------------------------------------------------------
const memoriaPontosTimeline = {};

function atualizarSequenciaJogo() {
    const jogoSel = document.getElementById("s6-filtro-jogo").value;
    const renderDiv = document.getElementById("s6-render");

    if (!jogoSel) {
        renderDiv.innerHTML = `
            <div class="py-8 text-center bg-zinc-900/50 border border-dashed border-zinc-800 rounded-xl">
                <p class="text-xs text-zinc-400">Selecione o <strong class="text-white">Jogo *</strong> para habilitar a timeline.</p>
            </div>
        `;
        return;
    }

    const gamePoints = rawData.filter(r => r.JOGO === jogoSel).sort((a,b) => a["Número do Ponto"] - b["Número do Ponto"]);
    if (gamePoints.length === 0) {
        renderDiv.innerHTML = `<p class="text-xs text-center text-zinc-500">Nenhum ponto encontrado.</p>`;
        return;
    }

    const dA = gamePoints[0]["Dupla A"];
    const dB = gamePoints[0]["Dupla B"];

    // Extrair Placar Final do Jogo
    const lastPt = gamePoints[gamePoints.length - 1];
    const finalScoreA = lastPt["Games depois A"] || 0;
    const finalScoreB = lastPt["Games depois B"] || 0;

    const barrasHTML = gamePoints.map((p, idx) => {
        const isWinnerA = p["Vencedor (Ponto)"] === 'A';
        const corBarra = isWinnerA ? "bg-[#D8F22A]" : "bg-cyan-400";
        
        // Mapeamento dinâmico de altura com limite mínimo e máximo
        const hPct = Math.min(Math.max((p.Rally / 18) * 100, 15), 100);

        const nextPt = gamePoints[idx + 1];
        
        // Identificar se foi o ponto que encerrou um game (mudança de game score ou último ponto)
        const isLastPtOfArray = (idx === gamePoints.length - 1);
        const closedGame = (p["Games depois A"] > p["Game antes A"]) || (p["Games depois B"] > p["Game antes B"]) || isLastPtOfArray;

        // Definir "PONTO DEPOIS" da dupla vencedora para colocar na legenda
        let labelPonto = isWinnerA ? p["Pontos depois A"] : p["Pontos depois B"];
        
        // Se fechou o game, força o texto a ser GAME
        if (closedGame) {
            labelPonto = "GAME";
        }

        memoriaPontosTimeline[p["Número do Ponto"]] = p;

        return `
            <div class="h-full flex flex-col justify-end items-center group relative cursor-pointer" onclick="abrirModalTimeline('${p["Número do Ponto"]}')">
                <!-- Tooltip flutuante de detalhes -->
                <div class="absolute -top-16 scale-0 group-hover:scale-100 bg-zinc-950 border border-zinc-800 text-[9px] rounded p-2 text-white z-20 pointer-events-none transition-all w-28 text-center shadow-xl">
                    <span class="font-bold block text-zinc-400">Pt ${p["Número do Ponto"]} | Game ${p.Game}</span>
                    <span>Rally: ${p.Rally} trocas</span>
                    <span class="text-[#D8F22A] block font-semibold truncate">Vencedor: Dupla ${isWinnerA ? 'A' : 'B'}</span>
                </div>

                <!-- Barra de Rali com Altura Fixada por Porcentagem em Relação ao Pai -->
                <div class="w-4 hover:scale-110 ${corBarra} rounded-t transition-all hover:brightness-125 shrink-0" style="height: ${hPct}%;"></div>

                <!-- Divisor de Espaço do Fim de Game -->
                ${closedGame ? `
                    <div class="absolute bottom-0 top-0 -right-2 w-[1px] border-r border-dashed border-zinc-700 h-full z-10 flex flex-col justify-start">
                        <span class="text-[6px] bg-zinc-800 text-white font-extrabold px-1 rounded transform -rotate-90 -translate-y-5">GAME</span>
                    </div>
                ` : ''}

                <!-- Placar do Ponto (Lógica de Ponto Depois ou GAME) -->
                <span class="text-[8px] text-zinc-500 font-black mt-2 select-none shrink-0 ${closedGame ? 'text-[#D8F22A] font-extrabold' : ''}">
                    ${labelPonto}
                </span>
            </div>
        `;
    }).join('');

    renderDiv.innerHTML = `
        <div class="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-4">
            
            <!-- PLACAR DESTAQUE DA PARTIDA -->
            <div class="bg-black/50 p-4 rounded-xl border border-zinc-800/80 flex justify-between items-center text-center">
                <div class="flex-1 text-left">
                    <span class="text-[8px] uppercase tracking-wider text-zinc-400 block">Dupla A</span>
                    <strong class="text-[#D8F22A] text-sm font-black">${dA}</strong>
                </div>
                <div class="px-6 flex items-center gap-3">
                    <span class="text-2xl font-black text-[#D8F22A]">${finalScoreA}</span>
                    <span class="text-xs text-zinc-500 font-bold uppercase tracking-widest">FIM</span>
                    <span class="text-2xl font-black text-cyan-400">${finalScoreB}</span>
                </div>
                <div class="flex-1 text-right">
                    <span class="text-[8px] uppercase tracking-wider text-zinc-400 block">Dupla B</span>
                    <strong class="text-cyan-400 text-sm font-black">${dB}</strong>
                </div>
            </div>

            <div class="flex justify-between items-center text-[10px] font-bold uppercase pb-3 border-b border-zinc-800/50">
                <span class="flex items-center gap-1.5 text-zinc-400">
                    <span class="w-3 h-3 bg-[#D8F22A] rounded-sm"></span> Dupla A
                </span>
                <span class="flex items-center gap-1.5 text-zinc-400">
                    <span class="w-3 h-3 bg-cyan-400 rounded-sm"></span> Dupla B
                </span>
            </div>

            <div class="overflow-x-auto pb-4 pt-4">
                <!-- Forçado h-48 para garantir que as alturas percentuais das barras funcionem -->
                <div class="flex items-end gap-3 h-48 min-w-max px-2 border-b border-zinc-800">
                    ${barrasHTML}
                </div>
            </div>

            <p class="text-[9px] text-zinc-500 text-center">Clique sobre qualquer barra para ver a ficha completa de lances daquele ponto.</p>
        </div>
    `;
}


// --------------------------------------------------------------------------------------
// CONTROLE DOS MODAIS
// --------------------------------------------------------------------------------------
function abrirModalPontos(title, key) {
    const list = memoriaPressao[key] || [];
    document.getElementById("modal-pontos-title").textContent = title;
    const contentDiv = document.getElementById("modal-pontos-content");
    contentDiv.innerHTML = "";

    if (list.length === 0) {
        contentDiv.innerHTML = `<p class="text-xs text-zinc-500 text-center py-6">Nenhum ponto registrado.</p>`;
    } else {
        list.forEach(p => {
            const row = document.createElement("div");
            row.className = "bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 items-center";
            row.innerHTML = `
                <div>
                    <div class="flex gap-1.5 mb-1.5 flex-wrap">
                        <span class="bg-black text-[#D8F22A] font-bold px-1.5 py-0.5 rounded text-[9px] uppercase">${p.JOGO}</span>
                        <span class="bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded text-[9px]">Game ${p.Game} (Pt ${p["Número do Ponto"]})</span>
                    </div>
                    <p class="text-zinc-400">Placar Anterior: <strong class="text-white">A: ${p["Pontos antes A"]} - B: ${p["Pontos antes B"]}</strong></p>
                    <p class="text-zinc-400">Placar Final: <strong class="text-white">A: ${p["Pontos depois A"]} - B: ${p["Pontos depois B"]}</strong></p>
                    <p class="text-zinc-400">Sacador: <strong class="text-zinc-250">${p["Jogador Sacador"]} (Dupla ${p["Dupla Sacadora"]})</strong></p>
                </div>
                <div>
                    <p class="text-zinc-400">Ação final: <strong class="text-white">${p["Nome Jogador Ação"]} (Dupla ${p["Dupla do Jogador Ação"]})</strong></p>
                    <p class="text-zinc-400">Tipo lance: <strong class="text-white">${p["Tipo de Golpe"]} (${p["Resumo ponto"]})</strong></p>
                    <p class="text-zinc-400">Rally: <strong class="text-[#D8F22A] font-bold">${p.Rally} toques</strong></p>
                </div>
            `;
            contentDiv.appendChild(row);
        });
    }

    document.getElementById("modal-pontos").classList.remove("hidden");
}

function fecharModalPontos() {
    document.getElementById("modal-pontos").classList.add("hidden");
}

function abrirModalTimeline(ptNum) {
    const p = memoriaPontosTimeline[ptNum];
    if (!p) return;

    const contentDiv = document.getElementById("modal-timeline-content");
    contentDiv.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <span class="text-[9px] uppercase text-zinc-500 block mb-1">Vencedor do Ponto</span>
                <strong class="text-[#D8F22A] text-xs block truncate">Dupla ${p["Vencedor (Ponto)"]}</strong>
            </div>
            <div class="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <span class="text-[9px] uppercase text-zinc-500 block mb-1">Rally total</span>
                <strong class="text-white text-xs block">${p.Rally} toques</strong>
            </div>
        </div>

        <div class="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
            <div class="flex justify-between border-b border-zinc-800 pb-1.5">
                <span class="text-zinc-400">Jogador Responsável</span>
                <strong class="text-white">${p["Nome Jogador Ação"]}</strong>
            </div>
            <div class="flex justify-between border-b border-zinc-800 pb-1.5">
                <span class="text-zinc-400">Tipo de Lance</span>
                <strong class="text-white uppercase text-[9px]">${p["Resumo ponto"]} (${p["VENCIDO/PERDIDO"]})</strong>
            </div>
            <div class="flex justify-between border-b border-zinc-800 pb-1.5">
                <span class="text-zinc-400">Golpe Final</span>
                <strong class="text-white">${p["Tipo de Golpe"]} (${p["Detalhe Ponto"]})</strong>
            </div>
            <div class="flex justify-between border-b border-zinc-800 pb-1.5">
                <span class="text-zinc-400">Sacador</span>
                <strong class="text-white">${p["Jogador Sacador"]}</strong>
            </div>
            <div class="flex justify-between border-b border-zinc-800 pb-1.5">
                <span class="text-zinc-400">Placar Antes do Lance</span>
                <strong class="text-white">A: ${p["Pontos antes A"]} | B: ${p["Pontos antes B"]}</strong>
            </div>
            <div class="flex justify-between">
                <span class="text-zinc-400">Placar Depois do Lance</span>
                <strong class="text-[#D8F22A]">A: ${p["Pontos depois A"]} | B: ${p["Pontos depois B"]}</strong>
            </div>
        </div>
    `;

    document.getElementById("modal-timeline").classList.remove("hidden");
}

function fecharModalTimeline() {
    document.getElementById("modal-timeline").classList.add("hidden");
}
