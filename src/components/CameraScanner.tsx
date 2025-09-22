'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues - using Scanner instead of QrScanner
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function CameraScanner({ isOpen, onClose, onScan }: CameraScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset states when scanner opens
      setError(null);
      setHasPermission(null);

      // Request camera permission
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(() => setHasPermission(true))
        .catch(() => {
          setHasPermission(false);
          setError('カメラへのアクセスが許可されていません');
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDecode = (result: string) => {
    // Parse the QR code URL to extract sid
    try {
      const url = new URL(result);
      const sid = url.searchParams.get('sid');
      if (sid) {
        onScan(sid);
        onClose();
      } else {
        setError('無効なQRコードです');
      }
    } catch {
      // Handle non-URL QR codes
      setError('無効なQRコードです');
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    setError('スキャン中にエラーが発生しました');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      <div className="bg-white text-black p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">QRコードをスキャン</h2>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 relative">
        {hasPermission === false ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-4">
            <svg
              className="w-24 h-24 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-center mb-4">カメラへのアクセスが拒否されました</p>
            <p className="text-sm text-gray-300 text-center">
              ブラウザの設定からカメラへのアクセスを許可してください
            </p>
          </div>
        ) : hasPermission === null ? (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p>カメラの許可を確認中...</p>
          </div>
        ) : (
          <>
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  handleDecode(result[0].rawValue);
                }
              }}
              onError={handleError}
              constraints={{
                facingMode: { ideal: 'environment' }
              }}
              styles={{
                container: {
                  width: '100%',
                  height: '100%'
                },
                video: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover' as const
                }
              }}
            />

            {/* Scanning overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg"></div>

                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-20 left-0 right-0 text-center text-white">
                <p className="text-lg">QRコードを枠内に合わせてください</p>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="absolute top-20 left-4 right-4 bg-red-500 text-white p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}