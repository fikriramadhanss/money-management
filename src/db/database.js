import Dexie from 'dexie';

export const db = new Dexie('MoneyManagerLite');

db.version(4).stores({
    users: '++id, email, name, password, createdAt',
    transactions: '++id, type, category, amount, date, walletId, createdAt',
    categories: '++id, name, type',
    budgets: '++id, category, limitAmount, month',
    wallets: '++id, name, initialBalance, color, icon',
    goals: '++id, name, targetAmount, savedAmount, deadline, color, icon'
});

db.on('populate', async () => {
    await db.wallets.bulkAdd([
        { name: 'Uang Tunai', initialBalance: 0, color: 'emerald', icon: 'cash' },
        { name: 'Rekening Bank', initialBalance: 0, color: 'blue', icon: 'landmark' },
    ]);

    await db.categories.bulkAdd([
        { name: 'Kebutuhan Harian', type: 'expense' },
        { name: 'Tagihan & Subskripsi', type: 'expense' },
        { name: 'Investasi Saham', type: 'expense' },
        { name: 'Gaji', type: 'income' },
    ]);
});