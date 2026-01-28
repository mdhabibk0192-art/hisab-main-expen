
import React from 'react';
import { DailyRow, EntryType, Transaction } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Icons } from '../constants';

interface ExcelTableProps {
  rows: DailyRow[];
  onAddEntry: (date: string, type: EntryType) => void;
  onEditNotes: (date: string, notes: string) => void;
  onDeleteTransaction: (date: string, type: EntryType, id: string) => void;
}

const ExcelTable: React.FC<ExcelTableProps> = ({ rows, onAddEntry, onEditNotes, onDeleteTransaction }) => {
  const sumAmount = (txs: Transaction[]) => txs.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex-1 overflow-auto bg-white shadow-inner rounded-t-xl border-t border-slate-200">
      <table className="w-full border-collapse text-xs sm:text-sm">
        <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
          <tr>
            <th className="p-3 border-b text-left w-24 font-semibold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="p-3 border-b text-right font-semibold text-green-600">Income</th>
            <th className="p-3 border-b text-right font-semibold text-red-600">Expenses</th>
            <th className="p-3 border-b text-right font-semibold text-orange-600">Bills</th>
            <th className="p-3 border-b text-right font-semibold text-blue-600">Extra</th>
            <th className="p-3 border-b text-left font-semibold text-slate-400">Notes</th>
            <th className="p-3 border-b text-right font-semibold text-indigo-600">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.date} className="hover:bg-slate-50 transition-colors group">
              <td className="p-3 font-medium text-slate-700 whitespace-nowrap bg-slate-50/50">
                {new Date(row.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
              </td>
              
              <td className="p-3 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-green-600">{formatCurrency(sumAmount(row.income))}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {row.income.map(t => (
                      <span key={t.id} onClick={() => onDeleteTransaction(row.date, EntryType.INCOME, t.id)} className="bg-green-50 text-[10px] px-1.5 py-0.5 rounded border border-green-100 text-green-700 cursor-pointer hover:bg-red-50 hover:border-red-200">
                        {t.category}: {t.amount}
                      </span>
                    ))}
                    <button onClick={() => onAddEntry(row.date, EntryType.INCOME)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center bg-green-100 rounded text-green-600">+</button>
                  </div>
                </div>
              </td>

              <td className="p-3 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-red-600">{formatCurrency(sumAmount(row.expenses))}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {row.expenses.map(t => (
                      <span key={t.id} onClick={() => onDeleteTransaction(row.date, EntryType.EXPENSE, t.id)} className="bg-red-50 text-[10px] px-1.5 py-0.5 rounded border border-red-100 text-red-700 cursor-pointer hover:bg-red-100">
                        {t.category}: {t.amount}
                      </span>
                    ))}
                    <button onClick={() => onAddEntry(row.date, EntryType.EXPENSE)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center bg-red-100 rounded text-red-600">+</button>
                  </div>
                </div>
              </td>

              <td className="p-3 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-orange-600">{formatCurrency(sumAmount(row.bills))}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {row.bills.map(t => (
                      <span key={t.id} onClick={() => onDeleteTransaction(row.date, EntryType.BILL_PAID, t.id)} className="bg-orange-50 text-[10px] px-1.5 py-0.5 rounded border border-orange-100 text-orange-700 cursor-pointer hover:bg-orange-100">
                        {t.category}: {t.amount}
                      </span>
                    ))}
                    <button onClick={() => onAddEntry(row.date, EntryType.BILL_PAID)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center bg-orange-100 rounded text-orange-600">+</button>
                  </div>
                </div>
              </td>

              <td className="p-3 text-right">
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-blue-600">{formatCurrency(sumAmount(row.extraIncome))}</span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {row.extraIncome.map(t => (
                      <span key={t.id} onClick={() => onDeleteTransaction(row.date, EntryType.EXTRA, t.id)} className="bg-blue-50 text-[10px] px-1.5 py-0.5 rounded border border-blue-100 text-blue-700 cursor-pointer hover:bg-blue-100">
                        {t.category}: {t.amount}
                      </span>
                    ))}
                    <button onClick={() => onAddEntry(row.date, EntryType.EXTRA)} className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center bg-blue-100 rounded text-blue-600">+</button>
                  </div>
                </div>
              </td>

              <td className="p-3">
                <input 
                  type="text" 
                  value={row.notes}
                  onChange={(e) => onEditNotes(row.date, e.target.value)}
                  placeholder="Tap to add notes..."
                  className="w-full bg-transparent border-none outline-none text-slate-500 focus:text-slate-900 placeholder-slate-300"
                />
              </td>

              <td className="p-3 text-right bg-slate-50/50">
                <div className="flex flex-col items-end">
                  <span className={`font-black ${row.dailyBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {formatCurrency(row.dailyBalance)}
                  </span>
                  <span className="text-[9px] text-slate-400">CF: {formatCurrency(row.carryForward)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelTable;
