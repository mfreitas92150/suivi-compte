import * as fs from 'fs';
import * as path from 'path';

function parseBoursoAmount(amountStr: string): number {
    // Handle "2 335,08" or "-66,74"
    const cleaned = amountStr.replace(/"/g, '').replace(/\s/g, '').replace(',', '.');
    return parseFloat(cleaned);
}

function parseLBPAmount(amountStr: string): number {
    const cleaned = amountStr.replace(',', '.');
    return parseFloat(cleaned);
}

function extractMayTransactions() {
    const boursoPath = path.join(process.cwd(), 'docs', 'export', 'bourso-08-06-2026_10-32-35.csv');
    const lbpPath = path.join(process.cwd(), 'docs', 'export', 'lbp-2955801S0291780907645288.csv');

    const transactions: any[] = [];

    // Process Bourso
    if (fs.existsSync(boursoPath)) {
        const content = fs.readFileSync(boursoPath, 'utf-8');
        const lines = content.split('\n');
        // skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(';');
            if (parts.length < 7) continue;

            const dateOp = parts[0]; // YYYY-MM-DD
            const label = parts[2].replace(/"/g, '');
            const amount = parseBoursoAmount(parts[6]);

            if (dateOp.startsWith('2026-05')) {
                transactions.push({
                    account: 'Boursorama',
                    date: dateOp,
                    label,
                    amount
                });
            }
        }
    }

    // Process LBP
    if (fs.existsSync(lbpPath)) {
        const content = fs.readFileSync(lbpPath, 'latin1'); // LBP often uses latin1 for accents
        const lines = content.split('\n');
        let dataStarted = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            if (line.startsWith('Date;Libell')) {
                dataStarted = true;
                continue;
            }

            if (!dataStarted) continue;

            const parts = line.split(';');
            if (parts.length < 3) continue;

            const dateStr = parts[0]; // DD/MM/YYYY
            const label = parts[1].replace(/"/g, '');
            const amount = parseLBPAmount(parts[2]);

            const [day, month, year] = dateStr.split('/');
            if (month === '05' && year === '2026') {
                transactions.push({
                    account: 'LBP',
                    date: `${year}-${month}-${day}`,
                    label,
                    amount
                });
            }
        }
    }

    // Sort by date
    transactions.sort((a, b) => a.date.localeCompare(b.date));

    console.log(JSON.stringify(transactions, null, 2));
}

extractMayTransactions();
