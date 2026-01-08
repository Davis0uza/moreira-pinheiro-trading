import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { uploadApi, ApiError } from '../../services/api';

interface ImageUploadProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    className?: string;
    helperText?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ label, value, onChange, className = '', helperText }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'upload' | 'url'>('upload');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        // Basic pre-validation
        if (!file.type.startsWith('image/')) {
            setError('Apenas imagens são permitidas (JPG, PNG, WebP).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('A imagem deve ter no máximo 5MB.');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Direct call to upload API
            const response = await uploadApi.upload(file);
            // Construct full URL if relative
            let fullUrl = response.url;
            if (response.url.startsWith('/')) {
                // Assuming API_BASE_URL is handled by the backend serving or we prepend it.
                // For now, let's rely on the returned URL being correct relative to domain 
                // or absolute if backend handles it.
                // Actually, let's use the one from env if relative for preview consistency if needed,
                // but usually backend returns relative path for storage efficiency.
                const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:3000';
                fullUrl = `${API_BASE_URL}${response.url}`;
            }
            onChange(fullUrl);
        } catch (err: any) {
            if (err instanceof ApiError) {
                setError(err.message || 'Falha no upload.');
            } else {
                setError('Ocorreu um erro ao enviar a imagem.');
            }
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = () => {
        onChange('');
        setError(null);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
                {!value && (
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => setMode('upload')}
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'upload' ? 'bg-white shadow text-corporate-primary' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('url')}
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${mode === 'url' ? 'bg-white shadow text-corporate-primary' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Link
                        </button>
                    </div>
                )}
            </div>

            {value ? (
                <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video md:aspect-[2/1] max-h-64">
                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors transform scale-90 group-hover:scale-100"
                            title="Remover imagem"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                mode === 'upload' ? (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-48 md:h-56
                ${isDragging ? 'border-corporate-primary bg-sky-50' : 'border-slate-200 hover:border-corporate-primary hover:bg-slate-50'}
                ${error ? 'border-red-300 bg-red-50' : ''}
            `}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                        />

                        {uploading ? (
                            <div className="flex flex-col items-center gap-2 text-corporate-primary">
                                <Loader2 size={32} className="animate-spin" />
                                <span className="text-xs font-bold uppercase tracking-widest">A enviar...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center gap-2 text-red-500">
                                <AlertCircle size={32} />
                                <span className="text-sm font-medium">{error}</span>
                                <span className="text-xs text-red-400">Clique para tentar novamente</span>
                            </div>
                        ) : (
                            <>
                                <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-corporate-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:text-corporate-primary'}`}>
                                    <Upload size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-700 mb-1">
                                    Arraste e solte ou clique para upload
                                </p>
                                <p className="text-xs text-slate-400">
                                    JPG, PNG ou WebP (max. 5MB)
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 h-48 md:h-56 flex flex-col justify-center gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">Colar Link da Imagem</label>
                            <input
                                type="text"
                                placeholder="https://exemplo.com/imagem.jpg"
                                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-corporate-primary transition-all"
                                onChange={(e) => onChange(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                            Cole o URL direto da imagem para a usar.
                        </p>
                    </div>
                )
            )}

            {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}
        </div>
    );
};

export default ImageUpload;
