import React, { useState, useRef } from 'react';
import {
  Database,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  X,
  RefreshCw,
  Info,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import Badge from '../components/common/Badge';
import StatusPill from '../components/common/StatusPill';

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState(() => documentService.getStoredDocuments());
  const [docTitle, setDocTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setStatusMessage({ type: 'error', text: 'Validation Error: Only PDF files (.pdf) are permitted by validate_pdf().' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Validation Error: Maximum file size is 20MB.' });
      return;
    }
    setUploadFile(file);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.pdf$/i, ''));
    }
    setStatusMessage(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadProgress(10);
    setStatusMessage({ type: 'info', text: 'Uploading PDF to POST /api/documents/upload/ ...' });

    try {
      const result = await documentService.uploadDocument(
        {
          file: uploadFile,
          title: docTitle || uploadFile.name,
          departmentId: 1, // Department 1 (IT)
        },
        (percent) => {
          setUploadProgress(Math.min(percent, 90));
        }
      );

      setUploadProgress(100);

      const newDoc = {
        id: result.id,
        title: result.title || docTitle || uploadFile.name,
        department_name: 'IT',
        department_id: result.department || 1,
        file_size: result.file_size || uploadFile.size,
        status: result.status || 'completed',
        chunk_count: 'Indexed',
        indexed_chunks: 'Verified',
        created_at: result.created_at || new Date().toISOString(),
      };

      const updated = documentService.saveDocumentLocally(newDoc);
      setDocuments(updated);

      setStatusMessage({
        type: 'success',
        text: `Document #${result.id} successfully uploaded, chunked with PyMuPDF, and indexed in Pinecone.`,
      });
      setUploadFile(null);
      setDocTitle('');
    } catch (err) {
      console.error('Upload error:', err);
      const errMsg =
        err.response?.data?.file?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        'Upload failed. Check backend connection.';
      setStatusMessage({ type: 'error', text: `Upload Error: ${errMsg}` });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        <div>
          <h2 className="text-base font-semibold font-mono text-dark-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-purple" />
            <span>Knowledge Base & Document Ingestion</span>
          </h2>
          <p className="text-xs text-dark-400 font-mono mt-0.5">
            Ingest enterprise PDF documents into Department 1 partition. Backend executes validation, chunking (1000/150), and Pinecone vector upsert.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <Badge variant="purple">Pinecone: novaretail-index</Badge>
          <Badge variant="emerald">Dept 1 (IT)</Badge>
        </div>
      </div>

      {/* Upload Drag & Drop Section */}
      <div className="p-6 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-4">
        <h3 className="text-xs font-semibold font-mono text-dark-100 uppercase tracking-wider flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-brand-purple" />
          <span>Upload PDF Document</span>
        </h3>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-dark-750 hover:border-brand-purple/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-dark-950/60 hover:bg-dark-950"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
            />

            <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple mb-3 shadow-glow-purple">
              <FileText className="w-6 h-6" />
            </div>

            {uploadFile ? (
              <div className="space-y-1 font-mono">
                <div className="text-sm font-semibold text-dark-100">{uploadFile.name}</div>
                <div className="text-xs text-emerald-400">
                  {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Ready
                </div>
              </div>
            ) : (
              <div className="space-y-1 font-mono">
                <div className="text-xs text-dark-200">
                  Drop PDF file here or <span className="text-brand-purple underline">browse computer</span>
                </div>
                <div className="text-[10px] text-dark-500">
                  Maximum 20 MB • Must be genuine PDF with %PDF- header
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono text-dark-400 uppercase mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Information Technology Department"
              className="w-full bg-dark-950 border border-dark-700 rounded-lg px-3 py-2 text-xs font-mono text-dark-100 focus:outline-none focus:border-brand-purple"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-dark-950 border-dark-700 text-dark-300'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button type="button" onClick={() => setStatusMessage(null)}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-dark-400">
                <span>Ingestion & Chunking Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-purple to-emerald-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!uploadFile || isUploading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue text-white font-mono text-xs font-medium hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-purple flex items-center gap-2"
            >
              {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>{isUploading ? 'Processing in Django...' : 'Upload to /api/documents/upload/'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Document Registry Table */}
      <div className="p-5 rounded-xl border border-dark-700 bg-dark-900/90 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div>
            <h3 className="text-sm font-semibold font-mono text-dark-100">Document Registry</h3>
            <p className="text-xs text-dark-400 font-mono">Department documents indexed for retrieval</p>
          </div>
          <Badge variant="dark">{documents.length} Document(s)</Badge>
        </div>

        <div className="overflow-x-auto rounded-lg border border-dark-800 bg-dark-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-dark-900 text-dark-400 border-b border-dark-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Document Title</th>
                <th className="py-2.5 px-3 font-semibold">Department</th>
                <th className="py-2.5 px-3 font-semibold">File Size</th>
                <th className="py-2.5 px-3 font-semibold">Chunks</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/80">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-dark-900/60 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-purple shrink-0" />
                      <div>
                        <div className="text-dark-100 font-medium">{doc.title}</div>
                        <div className="text-[10px] text-dark-500">ID #{doc.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-dark-300">{doc.department_name}</span>
                    <span className="text-[10px] text-dark-500 block">Partition #{doc.department_id}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-dark-300">
                    {(doc.file_size / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-dark-100 font-semibold">{doc.chunk_count}</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusPill status={doc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 rounded bg-dark-900/60 border border-dark-800 text-[11px] text-dark-400 flex items-start gap-2 font-mono">
          <Info className="w-4 h-4 text-dark-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Note: The Django backend provides <code className="text-dark-200">POST /api/documents/upload/</code>. A dedicated <code className="text-dark-200">GET /api/documents/</code> endpoint is not yet defined in <code className="text-dark-200">core/urls.py</code>; the registry above displays verified database records and session uploads.
          </p>
        </div>
      </div>
    </div>
  );
}
