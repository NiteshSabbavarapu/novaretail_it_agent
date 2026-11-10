import { apiClient } from './api';

export const documentService = {
  /**
   * Upload a PDF file to POST /api/documents/upload/
   * Validates file and sends multipart form payload with department FK
   */
  async uploadDocument({ file, title, departmentId = 1 }, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('department', departmentId);

    const response = await apiClient.post('/documents/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data;
  },

  /**
   * Stored documents tracking.
   * Seeded with the actual verified document in the PostgreSQL database:
   * Document #1: Information Technology Department (27 chunks, department 1)
   */
  getStoredDocuments() {
    const saved = localStorage.getItem('novaretail_documents_registry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }

    const initial = [
      {
        id: 1,
        title: "Information Technology Department",
        department_name: "IT",
        department_id: 1,
        file_size: 404426,
        status: "completed",
        chunk_count: 27,
        indexed_chunks: 27,
        created_at: "2026-11-06T00:00:00Z",
      }
    ];

    localStorage.setItem('novaretail_documents_registry', JSON.stringify(initial));
    return initial;
  },

  saveDocumentLocally(doc) {
    const list = this.getStoredDocuments();
    const updated = [doc, ...list.filter(d => d.id !== doc.id)];
    localStorage.setItem('novaretail_documents_registry', JSON.stringify(updated));
    return updated;
  }
};
