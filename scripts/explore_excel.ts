import * as XLSX from 'xlsx';
import * as path from 'path';

const excelFilePath = path.join(process.cwd(), 'docs', 'Copie de Suivi Comptes_2026.xlsm');

try {
    const workbook = XLSX.readFile(excelFilePath);
    console.log('--- Onglets trouvés ---');
    console.log(workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        // On convertit en JSON mais on limite pour ne pas saturer l'affichage
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 });
        console.log(`\n--- Échantillon de l'onglet: ${sheetName} (5 premières lignes) ---`);
        console.log(data.slice(0, 5));
    });
} catch (error) {
    console.error('Erreur lors de la lecture du fichier Excel:', error);
}
