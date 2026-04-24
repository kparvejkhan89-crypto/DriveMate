import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import { API_BASE_URL } from '../api/config';

import { IndianRupee, TrendingUp } from 'lucide-react';

export default function Expenses() {
  const { token } = useAppContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  
  // Filtering & Analytics State
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterActive, setFilterActive] = useState(true);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || !category || !date) {
      setError('Please fill in all details');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount, category, date })
      });
      if (!response.ok) throw new Error('Failed to add expense');
      await fetchExpenses();
      setShowAdd(false);
      setAmount(''); setCategory(''); setDate('');
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredExpenses = filterActive 
    ? expenses.filter(e => e.date.startsWith(selectedMonth))
    : expenses;

  const totalExpense = filteredExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  
  const categoryTotals = filteredExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const mostExpensiveCategory = sortedCategories[0]?.[0] || 'N/A';

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Expenses</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Expense'}
        </Button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <Card style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
           <div className="flex items-center gap-3">
             <div style={{ backgroundColor: '#DBEAFE', padding: '16px', borderRadius: '50%' }}>
               <TrendingUp size={32} className="text-primary"/>
             </div>
             <div>
               <p className="text-muted text-sm">{filterActive ? 'Monthly Spend' : 'Total Spend'}</p>
               <h2 className="text-3xl" style={{ color: '#1E3A8A' }}>₹{totalExpense.toFixed(2)}</h2>
               <p className="text-xs text-muted mt-1">{filterActive ? `Month: ${new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}` : 'All time'}</p>
             </div>
           </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
             <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Category Breakdown</h3>
             {sortedCategories.length > 0 && <span className="text-xs font-bold text-success">Most: {mostExpensiveCategory}</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedCategories.length > 0 ? sortedCategories.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{cat}</span>
                  <span className="text-muted">₹{val.toFixed(0)} ({((val/totalExpense)*100).toFixed(0)}%)</span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(val/totalExpense)*100}%`, backgroundColor: '#3B82F6', borderRadius: '3px' }}></div>
                </div>
              </div>
            )) : <p className="text-sm text-muted text-center py-4">No data for this period</p>}
          </div>
        </Card>
      </div>

      <div className="flex gap-4 items-end mb-8">
         <div className="input-group" style={{ marginBottom: 0, flex: 1, maxWidth: '200px' }}>
           <label className="input-label">Filter Month</label>
           <input 
             type="month" 
             className="input-field" 
             value={selectedMonth} 
             onChange={e => { setSelectedMonth(e.target.value); setFilterActive(true); }} 
           />
         </div>
         <Button variant="outline" onClick={() => setFilterActive(!filterActive)} style={{ height: '42px' }}>
           {filterActive ? 'Show All Time' : 'Filter by Month'}
         </Button>
      </div>

      {showAdd && (
        <Card className="w-full" style={{ marginBottom: '32px' }}>
          <h2 className="text-xl" style={{ marginBottom: '16px' }}>Add New Expense</h2>
          <form onSubmit={handleAddExpense} className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Input label="Amount (₹)" type="number" step="0.01" placeholder="e.g. 1500" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select Category</option>
                <option value="Fuel">Fuel</option>
                <option value="Service">Service</option>
                <option value="Wash">Car Wash</option>
                <option value="Insurance">Insurance</option>
                <option value="Toll">Toll / Parking</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
            
            <div style={{ gridColumn: '1 / -1' }}>
               <Button type="submit">Save Expense</Button>
            </div>
          </form>
        </Card>
      )}

      {filteredExpenses.length === 0 ? (
        <Card>
          <div className="empty-state">
            <IndianRupee size={48} className="text-muted" />
            <p>No expenses found for this period.</p>
            <Button variant="outline" onClick={() => setShowAdd(true)} style={{ marginTop: '16px' }}>Add New Expense</Button>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredExpenses.map(e => (
            <Card key={e.id}>
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg">{e.category}</h3>
                    <p className="text-muted text-sm">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold">₹{parseFloat(e.amount).toFixed(2)}</span>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
