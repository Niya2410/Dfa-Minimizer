cytoscape.use(cytoscapeDagre);

document.getElementById('runBtn').addEventListener('click', runMinimization);

function runMinimization() {
    const statesStr = document.getElementById('states').value;
    const alphabet = document.getElementById('alphabet').value.split(',').map(a => a.trim());
    const startState = document.getElementById('startState').value.trim();
    const finalStates = document.getElementById('finalStates').value.split(',').map(s => s.trim());
    const transitionInput = document.getElementById('transitions').value.split('\n');

    const transitions = {};
    const states = statesStr.split(',').map(s => s.trim()).filter(s => s !== "");

    states.forEach(s => transitions[s] = {});

    transitionInput.forEach(line => {
        const parts = line.split(',').map(item => item.trim());
        if (parts.length === 3) {
            const [from, char, to] = parts;
            if (states.includes(from)) transitions[from][char] = to;
        }
    });

    // Render Original
    renderGraph('cy-original', states, alphabet, transitions, finalStates, startState);

    // Minimization Logic
    let partitions = [
        states.filter(s => !finalStates.includes(s)), 
        states.filter(s => finalStates.includes(s))
    ].filter(p => p.length > 0);

    let changed = true;
    let step = 1;
    let log = `<strong>P0 (Initial):</strong> { ${partitions.map(p => `[${p.join(',')}]`).join(', ')} }<br>`;

    while (changed) {
        changed = false;
        let nextP = [];
        for (let group of partitions) {
            if (group.length <= 1) { nextP.push(group); continue; }
            let subgroups = [];
            for (let state of group) {
                let found = false;
                for (let sub of subgroups) {
                    let lead = sub[0];
                    let same = true;
                    for (let char of alphabet) {
                        if (getIdx(partitions, transitions[state][char]) !== getIdx(partitions, transitions[lead][char])) {
                            same = false; break;
                        }
                    }
                    if (same) { sub.push(state); found = true; break; }
                }
                if (!found) subgroups.push([state]);
            }
            if (subgroups.length > 1) changed = true;
            nextP.push(...subgroups);
        }
        partitions = nextP;
        log += `<strong>P${step++}:</strong> { ${partitions.map(p => `[${p.join(',')}]`).join(', ')} }<br>`;
    }
    document.getElementById('explanation').innerHTML = log;

    // Build Minimized
    const minStates = partitions.map(p => p.sort().join(''));
    const minTrans = {};
    const minFinals = [];
    let minStart = "";

    partitions.forEach(group => {
        const rep = group[0];
        const name = group.sort().join('');
        if (group.includes(startState)) minStart = name;
        if (finalStates.includes(rep)) minFinals.push(name);
        minTrans[name] = {};
        alphabet.forEach(char => {
            const target = transitions[rep][char];
            const targetName = partitions.find(p => p.includes(target)).sort().join('');
            minTrans[name][char] = targetName;
        });
    });

    renderGraph('cy-minimized', minStates, alphabet, minTrans, minFinals, minStart);
    // ... (inside runMinimization, after the partition logic)

generateTableFilling(states, finalStates, transitions, alphabet);

function generateTableFilling(states, finals, transitions, alphabet) {
    const tableContainer = document.getElementById('table-container');
    const n = states.length;
    let table = {};

    // 1. Initialize table: Mark pairs where one is final and the other is not
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let s1 = states[i];
            let s2 = states[j];
            let isOneFinal = (finals.includes(s1) && !finals.includes(s2)) || 
                             (!finals.includes(s1) && finals.includes(s2));
            table[`${s1}-${s2}`] = isOneFinal ? 'X' : '';
        }
    }

    // 2. Iteratively mark pairs until no more changes
    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                let s1 = states[i];
                let s2 = states[j];
                if (table[`${s1}-${s2}`] === 'X') continue;

                for (let char of alphabet) {
                    let next1 = transitions[s1][char];
                    let next2 = transitions[s2][char];
                    if (next1 === next2) continue;

                    let pair = [next1, next2].sort().join('-');
                    if (table[pair] === 'X') {
                        table[`${s1}-${s2}`] = 'X';
                        changed = true;
                        break;
                    }
                }
            }
        }
    }

    // 3. Render the HTML Table (Triangular Matrix)
    let html = '<table class="dist-table"><tr><th></th>';
    // Headers
    for (let i = 0; i < n - 1; i++) html += `<th>${states[i]}</th>`;
    html += '</tr>';

    for (let i = 1; i < n; i++) {
        html += `<tr><th>${states[i]}</th>`;
        for (let j = 0; j < n - 1; j++) {
            if (j < i) {
                let pair = [states[i], states[j]].sort().join('-');
                let val = table[pair] === 'X' ? 'X' : '○';
                html += `<td class="${val === 'X' ? 'marked' : ''}">${val}</td>`;
            } else {
                html += '<td style="background:rgba(255,255,255,0.05)"></td>';
            }
        }
        html += '</tr>';
    }
    html += '</table>';
    tableContainer.innerHTML = html;
}
}

function getIdx(parts, state) { return parts.findIndex(p => p.includes(state)); }

function renderGraph(id, states, alphabet, trans, finals, start) {
    const elements = [];
    if (start) elements.push({ data: { id: 'dummy' }, classes: 'invisible' });

    states.forEach(s => {
        elements.push({ 
            data: { 
                id: s, label: s,
                bg: finals.includes(s) ? '#ef4444' : '#1e293b',
                border: s === start ? '#38bdf8' : '#334155',
                bw: s === start ? 3 : 1
            },
            classes: finals.includes(s) ? 'final' : ''
        });
    });

    for (let from in trans) {
        for (let char in trans[from]) {
            elements.push({ data: { source: from, target: trans[from][char], label: char } });
        }
    }

    if (start) elements.push({ data: { source: 'dummy', target: start, label: 'start' }, classes: 'start-edge' });

    cytoscape({
        container: document.getElementById(id),
        elements: elements,
        style: [
            { selector: 'node', style: { 'label': 'data(label)', 'background-color': 'data(bg)', 'color': '#fff', 'border-width': 'data(bw)', 'border-color': 'data(border)', 'text-valign': 'center', 'width': 40, 'height': 40, 'font-size': '12px' }},
            { selector: 'node.final', style: { 'border-width': 4, 'border-style': 'double', 'border-color': '#fff' }},
            { selector: 'node.invisible', style: { 'visibility': 'hidden', 'width': 1, 'height': 1 }},
            { selector: 'edge', style: { 'label': 'data(label)', 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'line-color': '#475569', 'target-arrow-color': '#475569', 'color': '#94a3b8', 'font-size': '10px', 'text-margin-y': -10 }},
            { selector: 'edge.start-edge', style: { 'width': 2, 'line-color': '#38bdf8', 'target-arrow-color': '#38bdf8', 'color': '#38bdf8' }}
        ],
        layout: { name: 'dagre', rankDir: 'LR', padding: 50 }
    });
}