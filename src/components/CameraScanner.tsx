'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(m => m.Scanner),
  { ssr: false }
);

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export default function CameraScanner({ isOpen, onClose, onScan }: CameraScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 選択したカメラ
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  // fallback 用：front を使っているか？
  const [usingFront, setUsingFront] = useState(false);

  // アクティブなストリームを追跡
  const activeStreamRef = useRef<MediaStream | null>(null);

  // constraints 変更時に再マウントさせる key
  const scannerKey = useMemo(
    () => `scanner-${deviceId ?? (usingFront ? 'front' : 'env')}-${Date.now()}`,
    [deviceId, usingFront]
  );

  // 全てのメディアストリームを停止する関数
  const stopAllStreams = () => {
    // activeStreamRef の解放
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      activeStreamRef.current = null;
    }

    // 全てのビデオ要素を探してストリームを停止
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      const stream = (video as HTMLVideoElement).srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        (video as HTMLVideoElement).srcObject = null;
      }
    });
  };

  useEffect(() => {
    if (!isOpen) {
      // モーダルを閉じる時にすべてのストリームを停止
      stopAllStreams();
      return;
    }

    setError(null);
    setHasPermission(null);
    setDeviceId(undefined);
    setUsingFront(false);

    // 少し遅延を入れて前のストリームが確実に解放されるのを待つ
    const timeoutId = setTimeout(() => {
      // 1) 先に権限を取る（iOS の label 問題に対応）
      // 最初から背面カメラを要求
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
        .then(async (stream) => {
          activeStreamRef.current = stream;
          setHasPermission(true);

          // 2) カメラ列挙 → 背面候補優先
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videos = devices.filter(d => d.kind === 'videoinput');

          const back = videos.find(d => /back|rear|environment/i.test(d.label));
          if (back?.deviceId) {
            setDeviceId(back.deviceId);
            setUsingFront(false);
          } else if (videos.length > 0) {
            // 背面がなければデフォルトはenvironment制約で任せる
            // deviceIdは指定しない（facingModeで制御）
            setDeviceId(undefined);
            setUsingFront(false);
          }

          // 権限取得に使ったストリームは閉じる（Scanner に任せる）
          stream.getTracks().forEach(t => t.stop());
          activeStreamRef.current = null;
        })
        .catch((err) => {
          // 背面カメラが利用できない場合はフロントカメラで再試行
          console.warn('背面カメラ取得失敗、フロントカメラで再試行:', err);
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(async (stream) => {
              activeStreamRef.current = stream;
              setHasPermission(true);
              const devices = await navigator.mediaDevices.enumerateDevices();
              const videos = devices.filter(d => d.kind === 'videoinput');
              if (videos.length > 0) {
                setDeviceId(videos[0]?.deviceId);
                setUsingFront(true);
              }
              stream.getTracks().forEach(t => t.stop());
              activeStreamRef.current = null;
            })
            .catch(() => {
              setHasPermission(false);
              setError('カメラへのアクセスが許可されていません');
            });
        });
    }, 100); // 100ms の遅延

    // クリーンアップ
    return () => {
      clearTimeout(timeoutId);
      stopAllStreams();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDecode = (val: string) => {
    try {
      const url = new URL(val);
      const sid = url.searchParams.get('sid');
      if (sid) {
        // 即座に振動フィードバック（対応デバイスのみ）
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }

        // ストリームを停止してから閉じる
        stopAllStreams();

        // カメラを即座に閉じる（モーダル表示を優先）
        onClose();

        // スキャン結果を親コンポーネントに通知
        onScan(sid);
        return;
      }
    } catch { /* not a URL */ }
    setError('無効なQRコードです');
  };

  const handleError = (e: any) => {
    console.error('QR Scanner Error:', e?.name ?? e, e);

    // タイムアウトエラーの場合
    if (e?.message?.includes('timed out') || e?.message?.includes('timeout')) {
      setError('カメラの起動に失敗しました。もう一度お試しください');
      // ストリームをクリーンアップしてリトライ準備
      stopAllStreams();
      setTimeout(() => {
        setError(null);
        setHasPermission(null);
        // 再初期化のためisOpenを切り替える
        window.location.reload();
      }, 2000);
      return;
    }

    // 代表的なエラー → 制約を緩めて再試行
    if (e?.name === 'OverconstrainedError' || e?.name === 'NotReadableError') {
      // フロント使用中なら制約を極力外してブラウザに選ばせる
      if (usingFront) {
        setDeviceId(undefined);     // deviceId 指定を外す
      } else {
        setUsingFront(true);        // フロントへ切替
      }
      setError('カメラ切替で再試行しています…');
      return; // Scanner は key 変化で再マウント
    }
    if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
      setHasPermission(false);
      setError('カメラへのアクセスが拒否されました');
      return;
    }
    setError('スキャン中にエラーが発生しました');
  };

  // 最終的に Scanner に渡す制約
  const constraints: MediaTrackConstraints | boolean =
    deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: usingFront ? 'user' : 'environment' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      <div className="bg-white text-black p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">QRコードをスキャン</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl">✕</button>
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
              key={scannerKey}
              onScan={(res) => { if (res && res.length > 0) handleDecode(res[0].rawValue); }}
              onError={handleError}
              constraints={constraints}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { width: '100%', height: '100%', objectFit: 'cover' as const }
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