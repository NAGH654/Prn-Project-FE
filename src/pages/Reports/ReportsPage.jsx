import { useEffect, useMemo, useState } from 'react';
import { apiService } from '@services/api';
import SessionSelector from '@components/SessionSelector';

const formatDateInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';

export default function ReportsPage() {
  const [examId, setExamId] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [odataQuery, setOdataQuery] = useState('');
  const [odataResult, setOdataResult] = useState(null);

  const filters = useMemo(() => ({ examId, from, to, page, pageSize }), [examId, from, to, page, pageSize]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReports({ examId, from, to, page, pageSize });
      setTotal(res.total || 0);
      setData(res.data || []);
    } catch (e) {
      console.error(e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const onExport = async () => {
    try {
      const blob = await apiService.exportReports({ examId, from, to });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SubmissionReport_${Date.now()}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed');
    }
  };

  const runOData = async () => {
    try {
      const res = await apiService.queryOData(odataQuery);
      setOdataResult(res);
    } catch (e) {
      alert('OData query failed');
    }
  };

  return (
    <div className="upload-section">
      <h2>Reports</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
        <div>
          <label className="label">Exam Session (for filter)</label>
          <SessionSelector onExamChange={setExamId} />
        </div>
        <div>
          <label className="label">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="lookup-input" />
        </div>
        <div>
          <label className="label">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="lookup-input" />
        </div>
        <div>
          <label className="label">Page size</label>
          <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }} className="lookup-input">
            {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <button className="lookup-btn" onClick={onExport}>Export Excel</button>
        </div>
      </div>

      <div style={{ marginTop: 16, background: 'white', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f6f6ff', textAlign: 'left' }}>
              {['StudentId','StudentName','ExamName','SubmissionTime','ViolationCount','TotalAverageScore'].map(h => (
                <th key={h} style={{ padding: 12, borderBottom: '1px solid #eee' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 16 }}>Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 16 }}>No data</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.submissionId || r.SubmissionId}>
                  <td style={{ padding: 12, borderBottom: '1px solid #f2f2f2' }}>{r.studentId}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f2f2f2' }}>{r.studentName || ''}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f2f2f2' }}>{r.examName}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f2f2f2' }}>{new Date(r.submissionTime).toLocaleString()}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f2f2f2' }}>{r.violationCount}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f2f2f2' }}>{r.totalAverageScore?.toFixed?.(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
          <div>Total: {total}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="lookup-btn" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
            <div style={{ padding: '8px 12px' }}>Page {page}</div>
            <button className="lookup-btn" disabled={(page*pageSize)>=total} onClick={() => setPage(p => p+1)}>Next</button>
          </div>
        </div>
      </div>

      <div className="manual-lookup" style={{ marginTop: 16 }}>
        <h3>OData (advanced)</h3>
        <div className="lookup-input-group">
          <input
            type="text"
            placeholder="e.g. ?$count=true&$top=5 or ?$filter=HasViolations eq true"
            className="lookup-input"
            value={odataQuery}
            onChange={(e) => setOdataQuery(e.target.value)}
          />
          <button className="lookup-btn" onClick={runOData}>Run</button>
        </div>
        {odataResult && (
          <pre style={{ background: '#111', color: '#0f0', borderRadius: 8, padding: 12, overflow: 'auto', maxHeight: 240 }}>
            {JSON.stringify(odataResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}


