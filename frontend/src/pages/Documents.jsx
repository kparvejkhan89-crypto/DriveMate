import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { FileText, Download } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Registration Certificate (RC).pdf', type: 'Registration' },
    { id: 2, name: 'Insurance_Policy_2025.pdf', type: 'Insurance' }
  ]);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <h1 className="text-2xl">Documents</h1>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Upload Document'}
        </Button>
      </div>

      {showAdd && (
        <Card className="w-full" style={{ marginBottom: '32px' }}>
          <h2 className="text-xl" style={{ marginBottom: '16px' }}>Upload New Document</h2>
          <form className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }} onSubmit={e => e.preventDefault()}>
             <Input label="Document Name" placeholder="e.g. PUC Certificate" />
             <Input label="File" type="file" />
            <div style={{ gridColumn: '1 / -1' }}>
               <Button type="submit">Upload</Button>
            </div>
          </form>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card>
          <div className="empty-state">
            <FileText size={48} className="text-muted" />
            <p>No documents uploaded yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {documents.map(d => (
            <Card key={d.id}>
              <div className="flex items-center gap-3">
                <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
                  <FileText size={28} className="text-primary" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="text-base" style={{ wordBreak: 'break-all' }}>{d.name}</h3>
                  <p className="text-muted text-sm">{d.type}</p>
                </div>
                <Button variant="outline" size="sm" style={{ padding: '8px' }}>
                   <Download size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
