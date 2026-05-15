import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

export default function ExportButton({ data }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const timestamp = format(new Date(), 'yyyy-MM-dd');

  const downloadCSV = (filename, headers, rows) => {
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    a.click(); URL.revokeObjectURL(url);
    setOpen(false);
  };

  const exportResponses = () => {
    const headers = ['Date', 'Tail Number', 'Aircraft', 'Pilot', 'Management Co', 'Turn', 'Service', 'Comm', 'Composite', 'NPS', 'Follow-up Requested', 'Comment', 'Flagged'];
    const rows = (data.responses || []).map((r) => [
      format(new Date(r.date), 'yyyy-MM-dd HH:mm'),
      r.tailNumber, r.aircraftType, r.pilotName, r.managementCompany,
      r.turnScore, r.serviceScore, r.commScore, r.composite, r.npsScore,
      r.wantsCallback ? 'Yes' : 'No',
      r.commentText || '',
      r.flagged ? 'Yes' : 'No',
    ]);
    downloadCSV(`responses-${timestamp}.csv`, headers, rows);
  };

  const exportAlerts = () => {
    const headers = ['Date', 'Tail Number', 'Pilot', 'Turn', 'Service', 'Comm', 'Reasons', 'Status', 'Resolution', 'Resolved By'];
    const all = [...data.alerts.open, ...data.alerts.resolved];
    const rows = all.map((f) => [
      format(new Date(f.date), 'yyyy-MM-dd HH:mm'),
      f.tailNumber, f.pilotName, f.turnScore, f.serviceScore, f.commScore,
      f.flagReasons.join('; '),
      f.resolvedAt ? 'Resolved' : 'Open',
      f.resolutionNote || '',
      f.resolvedBy || '',
    ]);
    downloadCSV(`alerts-${timestamp}.csv`, headers, rows);
  };

  const exportFuel = () => {
    const headers = ['Date', 'Tail Number', 'Aircraft', 'Pilot', 'Gallons', 'PPG', 'Total', 'Savings', 'Margin', 'Invoice'];
    const rows = (data.allPurchases || []).map((p) => [
      format(new Date(p.date), 'yyyy-MM-dd HH:mm'),
      p.tailNumber, p.aircraftType, p.pilotName,
      p.gallons, p.flightsheetPPG, p.totalAmount, p.savingsAmount, p.margin,
      p.invoiceNumber,
    ]);
    downloadCSV(`fuel-sales-${timestamp}.csv`, headers, rows);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-heading font-semibold text-sm transition hover:bg-[var(--surface2)]"
        style={{ color: 'var(--text-sub)', border: '1px solid var(--border)' }}
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl border overflow-hidden z-50"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <button onClick={exportResponses} className="w-full px-4 py-3 text-left hover:bg-[var(--surface2)] transition">
            <p className="font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>Visit Responses</p>
            <p className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>All feedback data as CSV</p>
          </button>
          <button onClick={exportAlerts} className="w-full px-4 py-3 text-left hover:bg-[var(--surface2)] transition border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>Alerts & Flags</p>
            <p className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>Open and resolved flags</p>
          </button>
          <button onClick={exportFuel} className="w-full px-4 py-3 text-left hover:bg-[var(--surface2)] transition border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>Fuel Sales</p>
            <p className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>All fuel purchase records</p>
          </button>
        </div>
      )}
    </div>
  );
}
