import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFilePath = path.join(process.cwd(), 'docs', 'Copie de Suivi Comptes_2026.xlsm');

try {
    const workbook = XLSX.readFile(excelFilePath);
    
    // 1. Analyse plus fine de SYNTHESE DEPENSES
    const synthSheet = workbook.Sheets['SYNTHESE DEPENSES'];
    const synthData = XLSX.utils.sheet_to_json(synthSheet, { range: 0 });
    console.log('\n--- SYNTHESE DEPENSES (10 premières lignes avec headers) ---');
    console.log(synthData.slice(0, 10));

    // 2. Analyse plus fine d'un mois (JANVIER) pour trouver les charges fixes
    const janSheet = workbook.Sheets['JANVIER'];
    const janData = XLSX.utils.sheet_to_json(janSheet, { header: 1, range: 0 });
    console.log('\n--- JANVIER (Lignes 5 à 30 pour chercher les tableaux de charges/revenus) ---');
    janData.slice(5, 30).forEach((row, index) => {
        console.log(`Ligne ${index + 5}:`, row);
    });

} catch (error) {
    console.error('Erreur lors de la lecture du fichier Excel:', error);
}
