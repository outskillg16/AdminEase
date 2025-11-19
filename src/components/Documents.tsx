import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  File,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Loader2,
  User,
  Settings,
  LogOut,
  Zap,
  Menu,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DocumentsProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onLogout: () => void;
}

interface Document {
  id: string;
  file_name: string;
  document_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_status: string;
  created_at: string;
  updated_at?: string;
}

interface SearchResult {
  document_id: string;
  document_name: string;
  mime_type: string;
  content_chunk: string;
  similarity: number;
}

const DOCUMENT_TYPES = [
  { value: 'contract', label: 'Contract' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'legal', label: 'Legal Document' },
  { value: 'tax', label: 'Tax Document' },
  { value: 'license', label: 'License' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function Documents({ user, onLogout }: DocumentsProps) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('other');
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Documents');

  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('business_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDocuments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Onboarding') navigate('/onboarding');
    if (tab === 'AI Configuration') navigate('/ai-configuration');
    if (tab === 'Call Management') navigate('/call-management');
    if (tab === 'Appointments') navigate('/appointments');
    if (tab === 'Documents') navigate('/documents');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) throw new Error('Business profile not found');

      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('business_documents')
        .insert({
          business_profile_id: profile.id,
          user_id: user.id,
          document_type: documentType,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          upload_status: 'uploaded',
        });

      if (insertError) throw insertError;

      setShowUploadModal(false);
      setSelectedFile(null);
      setDocumentType('other');
      loadDocuments();
      setSuccess('Document uploaded successfully! Processing for search...');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-documents`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: searchQuery,
          matchThreshold: 0.3,
          matchCount: 20,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const results = await response.json();
      setSearchResults(results || []);
      setShowSearchResults(true);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed. Make sure documents have been processed.');
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleView = async (doc: Document) => {
    try {
      const { data, error: urlError } = await supabase.storage
        .from('business-documents')
        .createSignedUrl(doc.file_path, 60);

      if (urlError) throw urlError;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (doc: Document) => {
    setEditingDoc(doc);
    setNewFileName(doc.file_name);
  };

  const cancelEdit = () => {
    setEditingDoc(null);
    setNewFileName('');
  };

  const saveEdit = async () => {
    if (!editingDoc || !newFileName.trim()) return;

    try {
      const { error: updateError } = await supabase
        .from('business_documents')
        .update({ file_name: newFileName.trim() })
        .eq('id', editingDoc.id);

      if (updateError) throw updateError;

      loadDocuments();
      setEditingDoc(null);
      setNewFileName('');
      setSuccess('Document name updated successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.file_name}"?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('business-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: deleteError } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', doc.id);

      if (deleteError) throw deleteError;

      loadDocuments();
      setSuccess('Document deleted successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType === 'application/pdf') return FileText;
    if (mimeType.startsWith('text/')) return LinkIcon;
    return File;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      const ext = mimeType.split('/')[1].toUpperCase();
      return `${ext} Image`;
    }
    if (mimeType === 'application/pdf') return 'PDF Document';
    if (mimeType.startsWith('text/')) return 'URL Link';
    return 'Document';
  };

  const formatFileSize = (bytes: number) => {
    return Math.round(bytes / 1024);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  const displayDocuments = showSearchResults ? searchResults : documents;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                AdminEase
              </span>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleNavigate(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab
                      ? 'text-cyan-600 border-cyan-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {showMobileMenu ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{initials}</span>
                    </div>
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={onLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-3">
              <nav className="flex flex-col space-y-1">
                {['Dashboard', 'Onboarding', 'AI Configuration', 'Call Management', 'Appointments', 'Documents'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      handleNavigate(tab);
                      setShowMobileMenu(false);
                    }}
                    className={`px-4 py-3 text-sm font-medium text-left transition-all ${
                      activeTab === tab
                        ? 'bg-cyan-50 text-cyan-600 border-l-4 border-cyan-600'
                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
            <p className="text-gray-600">Manage and search your business documents with AI</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-600" /></button>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm text-green-800">{success}</p>
            <button onClick={() => setSuccess(null)}><X className="w-4 h-4 text-green-600" /></button>
          </div>
        )}

        {/* Search Interface */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search documents using natural language... (e.g., 'find contracts from last month')"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searching}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
            {showSearchResults && (
              <button
                onClick={clearSearch}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {showSearchResults && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <p className="text-gray-700">
              Found <span className="font-semibold text-cyan-600">{searchResults.length}</span> relevant documents
            </p>
          </div>
        )}

        {/* Documents List */}
        {displayDocuments.length === 0 ? (
          <EmptyState
            showSearchResults={showSearchResults}
            onClear={clearSearch}
            onUpload={() => setShowUploadModal(true)}
          />
        ) : showSearchResults ? (
          <div className="space-y-4">
            {searchResults.map((result) => (
              <SearchResultCard
                key={result.document_id}
                result={result}
                onView={() => {
                  const doc = documents.find(d => d.id === result.document_id);
                  if (doc) handleView(doc);
                }}
                getFileIcon={getFileIcon}
                getFileTypeLabel={getFileTypeLabel}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                editingDoc={editingDoc}
                newFileName={newFileName}
                setNewFileName={setNewFileName}
                onView={() => handleView(doc)}
                onEdit={() => startEdit(doc)}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onDelete={() => handleDelete(doc)}
                getFileIcon={getFileIcon}
                getFileTypeLabel={getFileTypeLabel}
              />
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          documentType={documentType}
          setDocumentType={setDocumentType}
          selectedFile={selectedFile}
          uploading={uploading}
          onFileSelect={handleFileSelect}
          onUpload={handleUpload}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedFile(null);
            setDocumentType('other');
          }}
          formatFileSize={formatFileSize}
        />
      )}
    </div>
  );
}

function SearchResultCard({
  result,
  onView,
  getFileIcon,
  getFileTypeLabel,
}: {
  result: SearchResult;
  onView: () => void;
  getFileIcon: (mimeType: string) => any;
  getFileTypeLabel: (mimeType: string) => string;
}) {
  const FileIcon = getFileIcon(result.mime_type);
  const matchPercentage = Math.round(result.similarity * 100);

  return (
    <div className="bg-gradient-to-r from-cyan-50 to-white border-2 border-cyan-200 rounded-xl shadow-md hover:shadow-lg transition-all p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
            <FileIcon className="w-6 h-6 text-cyan-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{result.document_name}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
              {matchPercentage}% match
            </span>
          </div>
          <p className="text-sm text-cyan-600 mb-2">{getFileTypeLabel(result.mime_type)}</p>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <p className="text-sm text-slate-700 line-clamp-2">{result.content_chunk}</p>
          </div>
        </div>
        <button
          onClick={onView}
          className="flex-shrink-0 p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function DocumentCard({
  doc,
  editingDoc,
  newFileName,
  setNewFileName,
  onView,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  getFileIcon,
  getFileTypeLabel,
}: any) {
  const FileIcon = getFileIcon(doc.mime_type);
  const isEditing = editingDoc?.id === doc.id;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md hover:shadow-lg transition-all p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center">
              <FileIcon className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3 py-1 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 text-lg font-semibold"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-900 truncate">{doc.file_name}</h3>
            )}
            <p className="text-sm text-cyan-600">{getFileTypeLabel(doc.mime_type)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={onCancel}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onView}
                className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  showSearchResults,
  onClear,
  onUpload,
}: {
  showSearchResults: boolean;
  onClear: () => void;
  onUpload: () => void;
}) {
  if (showSearchResults) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
        <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600 mb-4">Try a different search query</p>
        <button
          onClick={onClear}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
      <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
      <p className="text-gray-600 mb-6">Upload your first document to get started</p>
      <button
        onClick={onUpload}
        className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center space-x-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        <span>Upload Document</span>
      </button>
    </div>
  );
}

function UploadModal({
  documentType,
  setDocumentType,
  selectedFile,
  uploading,
  onFileSelect,
  onUpload,
  onClose,
  formatFileSize,
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
            <input
              type="file"
              onChange={onFileSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedFile.name} ({formatFileSize(selectedFile.size)} KB)
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
