document.addEventListener('DOMContentLoaded', () => {
    const askForm = document.getElementById('ask-form');
    const userInput = document.getElementById('user-input');
    const chatContainer = document.getElementById('chat-container');
    const analysisDashboard = document.getElementById('analysis-dashboard');
    const matrixContent = document.getElementById('matrix-content');
    const tabBtns = document.querySelectorAll('.tab-btn');
    // Checkboxes removed. Defaulting to Google Search = true.
    const useGoogleCb = null;
    const useDirectorCb = null;

    let currentPhases = [];
    const inputContainer = document.getElementById('input-container');
    const resetContainer = document.getElementById('reset-container');
    const resetBtn = document.getElementById('reset-btn');
    const homeHero = document.getElementById('home-hero');

    if (userInput) userInput.focus();

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.tab);
            setActiveTab(idx);
        });
    });

    function setActiveTab(idx) {
        tabBtns.forEach((b, i) => {
            if (i === idx) b.classList.add('active');
            else b.classList.remove('active');
        });
        renderPhase(idx);
    }

    function renderPhase(idx) {
        const phase = currentPhases[idx];
        if (!phase) {
            matrixContent.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500 italic">フェーズ ${idx + 1} の分析はまだ完了していません。</div>`;
            return;
        }

        const result = phase.analysis;
        let html = `<div class="fade-in">`;
        html += `<div class="mb-10 p-6 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-inner">
                    <span class="text-[10px] text-purple-400 font-mono tracking-widest uppercase mb-2 block opacity-60">分析指令 (DIRECTIVE)</span>
                    <h2 class="text-2xl font-display font-light text-white leading-tight">${phase.directorPrompt}</h2>
                 </div>`;



        if (result.report) {
            html += renderMatrixTable(result.report, result.framework);
        } else if (result.summary) {
            if (idx === 3) { // Final Wrap-up special styling
                html += `
                <div class="summary-container relative py-16 px-4">
                    <!-- Bio-organic background blobs -->
                    <div class="biomorphic-blob top-0 left-10 w-64 h-64 bg-purple-600/20"></div>
                    <div class="biomorphic-blob bottom-0 right-10 w-96 h-96 bg-blue-600/10"></div>
                    
                    <div class="relative max-w-4xl mx-auto biomorphic-surface p-12 md:p-16 overflow-hidden">
                        <div class="prose prose-invert prose-lg max-w-none 
                            prose-headings:font-display prose-headings:font-medium
                            prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-li:text-gray-300
                            prose-strong:text-purple-300">
                            ${marked.parse(result.summary)}
                        </div>
                    </div>
                    
                    <div class="mt-16 flex justify-center">
                         <div class="px-6 py-2 rounded-full border border-purple-500/20 text-[10px] text-purple-400/60 uppercase tracking-[0.3em] font-mono">
                            Organic Logic Synthesis Complete
                         </div>
                    </div>
                </div>`;
            } else {
                html += `<div class="prose prose-invert max-w-none mt-4">${marked.parse(result.summary)}</div>`;
            }
        }

        html += `</div>`;
        matrixContent.innerHTML = html;
    }

    if (askForm) {
        askForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prompt = userInput.value.trim();
            if (!prompt) return;

            userInput.value = '';

            // Hide Hero and Input to prevent interruption
            if (homeHero) homeHero.classList.add('hidden');
            inputContainer.classList.add('hidden');

            // Show dashboard and chat
            analysisDashboard.classList.remove('hidden');
            chatContainer.classList.remove('hidden');
            chatContainer.innerHTML = ''; // Clear logs
            currentPhases = [];

            appendLog('system', `思考の醸成（Kamos）を開始します: "${prompt}"`);
            appendLog('system', `注意: 深い分析には通常2〜3分ほどかかります。`);
            if (window.setThinking) window.setThinking(true);

            let elapsed = 0;
            const timer = setInterval(() => {
                elapsed += 10;
                if (elapsed % 30 === 0) {
                    appendLog('system', `分析を深めています... (経過時間: ${elapsed}秒)。GeminiとKamosが思考を継続中です。`);
                }
            }, 10000);

            try {
                const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                    ? 'http://127.0.0.1:5001/ask-kamos/asia-northeast1/askKamos'
                    : 'https://asia-northeast1-ask-kamos.cloudfunctions.net/askKamos';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: prompt,
                        autonomousMode: true,
                        useGoogleSearch: true, // Always ON
                        includePastArticles: false // Always OFF
                    })
                });

                if (!response.ok) throw new Error('Autonomous Loop Failed');

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Keep partial line in buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.substring(6);
                            try {
                                const chunk = JSON.parse(jsonStr);
                                if (chunk.error) throw new Error(chunk.error);

                                if (chunk.status) {
                                    appendLog(chunk.role || 'system', chunk.status);
                                    continue;
                                }

                                if (chunk.phaseNum) {
                                    // Stop the timer as soon as first data arrives
                                    if (chunk.phaseNum === 1) clearInterval(timer);

                                    currentPhases[chunk.phaseNum - 1] = chunk;
                                    appendLog('kamos', `フェーズ ${chunk.phaseNum} の分析を受信中...`);

                                    // Auto-switch to and render the latest phase
                                    setActiveTab(chunk.phaseNum - 1);
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk", e);
                            }
                        }
                    }
                }

                appendLog('kamos', '深い分析が完了しました。すべての思考フェーズが生成されました。');
                resetContainer.classList.remove('hidden');

            } catch (error) {
                clearInterval(timer);
                appendLog('system', `エラーが発生しました: ${error.message}`);
                console.error(error);
            } finally {
                if (window.setThinking) window.setThinking(false);
            }
        });
    }

    function appendLog(role, text) {
        const div = document.createElement('div');
        div.className = 'text-sm font-mono flex gap-4 opacity-90 animate-in fade-in duration-300';

        let color = 'text-red-400';
        let label = role.toUpperCase();

        if (role === 'user') color = 'text-blue-400';
        else if (role === 'system') color = 'text-gray-500';
        else if (role === 'gemini') {
            color = 'text-pink-400';
            label = 'GEMINI';
        }
        else if (role === 'kamos') {
            color = 'text-purple-400';
            label = 'KAMOS';
        }

        div.innerHTML = `<span class="${color} font-bold shrink-0">[${label}]</span> <span class="text-gray-300">${text}</span>`;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function renderMatrixTable(report, framework) {
        if (!framework || !framework.sections || framework.sections.length === 0) {
            return Object.entries(report).map(([k, v]) => `<h3>${k}</h3><div class="prose prose-invert mb-4">${marked.parse(v)}</div>`).join('');
        }

        const section = framework.sections[0];
        const rows = section.rows || [];
        const cols = section.columns || [];

        let html = `<div class="matrix-table-container overflow-x-auto"><table class="matrix-table w-full border-collapse">`;
        html += `<thead><tr><th class="p-4 bg-white/5 border border-white/10 text-left text-purple-400 font-mono text-xs uppercase">${section.structure_type || '-'}</th>`;
        cols.forEach(c => html += `<th class="p-4 bg-white/5 border border-white/10 text-left text-gray-400 font-display font-semibold">${c.title}</th>`);
        html += `</tr></thead><tbody>`;

        rows.forEach((r, rIdx) => {
            html += `<tr><th class="p-4 bg-white/5 border border-white/10 text-left font-display font-medium text-gray-300 w-1/5">${r.title}</th>`;
            cols.forEach((c, cIdx) => {
                // Try multiple key patterns
                const keysToTry = [
                    `${section.id}-${r.id}-${c.id}`, // section-1-row-0-col-0
                    `${r.id}-${c.id}`,               // row-0-col-0
                    `${rIdx}-${cIdx}`,               // 0-0
                    `section-${section.id}-${r.id}-${c.id}`,
                    `${section.id}_${r.id}_${c.id}`
                ];

                let content = '';
                for (const k of keysToTry) {
                    if (report[k]) {
                        content = report[k];
                        break;
                    }
                }

                // If still empty, try case-insensitive or partial match
                if (!content) {
                    const fallbackKey = Object.keys(report).find(k => k.includes(`${r.id}`) && k.includes(`${c.id}`));
                    if (fallbackKey) content = report[fallbackKey];
                }

                html += `<td class="p-4 border border-white/10 text-sm text-gray-400 align-top leading-relaxed hover:bg-white/5 transition-colors">
                    <div class="prose prose-invert prose-sm max-w-none">${content ? marked.parse(content) : '<span class="text-gray-600 italic">データがありません</span>'}</div>
                </td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        return html;
    }
});
