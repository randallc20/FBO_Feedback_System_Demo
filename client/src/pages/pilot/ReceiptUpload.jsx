import { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aircraft } from '../../data/aircraft';
import { managementCompanies } from '../../data/companies';

export default function ReceiptUpload({ onUpload }) {
  const { user } = useAuth();
  const ac = aircraft.find((a) => a.id === user.defaultAircraftId);
  const company = managementCompanies.find((c) => c.id === user.companyId);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    // Pass the actual file to the parent so it can be sent to the OCR API
    setTimeout(() => {
      onUpload(file);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {/* Pilot identity reminder */}
      <div className="bg-dark-surface rounded-lg p-3 flex items-center gap-3 mb-8 border border-gray-700/30">
        <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
          <span className="font-heading text-xs font-bold text-gold">{user.initials}</span>
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
          <p className="font-body text-xs text-gray-400">{ac?.tailNumber || ''} &middot; {company?.name || ''}</p>
        </div>
        <span className="ml-auto text-xs font-heading text-gold bg-gold/10 px-2 py-0.5 rounded">Verified</span>
      </div>

      <h2 className="font-heading text-2xl font-bold text-white text-center mb-2">Upload Fuel Receipt</h2>
      <p className="font-body text-sm text-gray-400 text-center mb-10">
        Take a photo or upload from your library
      </p>

      {/* Preview overlay */}
      {preview && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 max-w-sm mx-auto w-full animate-fadeIn">
          <div className="relative w-full rounded-2xl overflow-hidden border-2 border-gold/40 shadow-lg">
            <img src={preview} alt="Receipt preview" className="w-full max-h-[300px] object-cover" />
            <div className="absolute inset-0 bg-navy/60 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gold animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-heading text-lg font-semibold text-white">Processing...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!preview && (
        <>
          <div className="flex-1 flex flex-col gap-4 justify-center max-w-sm mx-auto w-full">
            {/* Take Photo */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full py-6 bg-dark-surface border-2 border-dashed border-gold/40 rounded-2xl flex flex-col items-center gap-3 hover:border-gold/70 transition group"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-heading text-lg font-semibold text-white">Take Photo</span>
              <span className="font-body text-xs text-gray-400">Use your device camera</span>
            </button>

            {/* Upload from Library */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 bg-dark-surface border-2 border-dashed border-gray-600 rounded-2xl flex flex-col items-center gap-3 hover:border-gray-400 transition group"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-heading text-lg font-semibold text-white">Upload from Library</span>
              <span className="font-body text-xs text-gray-400">Select an existing image</span>
            </button>
          </div>

          {/* Privacy notice */}
          <div className="mt-8 bg-navy border border-gray-700/50 rounded-lg p-4">
            <p className="font-body text-xs text-gray-500 text-center leading-relaxed">
              <span className="text-gold">Note:</span> All submissions are attributed to your name and tail number.
              Nothing is anonymous. Data is shared with the FBO for service improvement.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
