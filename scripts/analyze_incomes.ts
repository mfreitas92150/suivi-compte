import * as fs from 'fs';
import * as path from 'path';

function parseAmount(amountStr: string): number {
    const cleaned = amountStr.replace(/"/g, '').replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned);
}

function analyzeIncomes() {
    const boursoPath = path.join(process.cwd(), 'docs', 'export', 'bourso-08-06-2026_10-32-35.csv');
    const lbpPath = path.join(process.cwd(), 'docs', 'export', 'lbp-2955801S0291780907645288.csv');

    console.log('--- Revenus détectés en Mai 2026 ---');

    // Boursorama
    if (fs.existsSync(boursoPath)) {
        const lines = fs.readFileSync(boursoPath, 'utf-8').split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length < 7) continue;
            const date = parts[0];
            const label = parts[2].replace(/"/g, '');
            const amount = parseAmount(parts[6]);
            if (date.startsWith('2026-05') && amount > 0) {
                console.log(`[Bourso] ${date} | ${amount.toFixed(2)}€ | ${label}`);
            }
        }
    }

    // LBP
    if (fs.existsSync(lbpPath)) {
        const lines = fs.readFileSync(lbpPath, 'latin1').split('\n');
        let started = false;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Date;Libell')) { started = true; continue; }
            if (!started) continue;
            const parts = trimmed.split(';');
            if (parts.length < 3) continue;
            const date = parts[0];
            const label = parts[1].replace(/"/g, '');
            const amount = parseAmount(parts[2]);
            if (date.includes('/05/2026') && amount > 0) {
                console.log(`[LBP]    ${date} | ${amount.toFixed(2)}€ | ${label}`);
            }
        }
    }
}

analyzeIncomes();
