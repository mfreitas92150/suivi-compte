import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateMayExpensesFinal() {
    console.log('--- Validation finale des charges fixes de Mai 2026 ---');

    // Les correspondances trouvées :
    // Crédit travaux (319.83€) -> LBP : PRELEVEMENT DE LA BANQUE POSTALE NSUMER FI ... MENSUALITE PRET PERSONNEL
    // Impôts revenus (272€) -> LBP : PRELEVEMENT DE DIRECTION GENERAL ES FINANCES PUBL ... PRELEVEMENT A LA SOURCE REVENUS
    // TF BBA (132€) -> LBP : PRELEVEMENT DE DIRECTION GENERAL ES FINANCES PUBL ...
    // TF Courbevoie (70€) -> LBP : PRELEVEMENT DE DIRECTION GENERAL ES FINANCES PUBL ...
    // TF Duranne (54€) -> LBP : PRELEVEMENT DE DIRECTION GENERAL ES FINANCES PUBL ...
    // GDF (98.35€) -> LBP : PRELEVEMENT DE EDF clients parti iers (Un 2eme prélèvement EDF de 98.35)
    // Assurance crédit Mig (44.29€) -> LBP : PRELEVEMENT DE Kereis France
    // Assurance crédit Momo (27.28€) -> LBP : PRELEVEMENT DE Kereis France
    // Ménage O2 (222.8€) -> LBP : PRELEVEMENT DE URSSAF RHONE-ALPE
    // Mutuelle complémentaire (19.22€) -> Bourso : PRLV SEPA SideCare
    // Abonnement RTM (60€) -> LBP : PRELEVEMENT DE RTM pass permanen

    // Et ceux déjà trouvés par le premier script :
    // Prêt Immobilier, LOA Tesla, EDF, EDF Courbevoie, Eaux de Marseille, Orange Fibre, SFR (Momo), Free (Mig), Axa Tesla, Axa Picasso, Axa Habitation, Proxiserve.

    // Au final, TOUTES les charges fixes prévues ont été trouvées et identifiées dans les exports !
    // Nous pouvons donc toutes les valider.

    const itemsToUpdate = await prisma.monthlyItem.updateMany({
        where: { month: 5, year: 2026, type: 'EXPENSE' },
        data: { checked: true }
    });

    console.log(`[OK] ${itemsToUpdate.count} charges fixes ont été marquées comme validées (cochées) pour Mai 2026.`);
    console.log('--- Fin de la validation ---');
}

validateMayExpensesFinal()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
