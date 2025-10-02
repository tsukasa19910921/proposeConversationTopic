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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 常に表示される背景レイヤー（黒またはグラデーション） */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-teal-800 to-blue-900" />

      {/* カメラ映像レイヤー（権限取得後のみ） */}
      <div className="absolute inset-0">
        {hasPermission === true && (
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
        )}
      </div>

      {/* くり抜きマスク＋角マーカー＋スキャンライン */}
      {hasPermission === true && (
        <>
          {/* くり抜きオーバーレイ（四角形） - サイズを拡大 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-2xl shadow-[0_0_0_200vmax_rgba(0,0,0,0.45)]"></div>
          </div>

          {/* 角マーカー＋スキャンライン - サイズを拡大 */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              {/* 角マーカー（ネオン風） */}
              <div className="absolute -top-1 -left-1 w-16 h-16 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl"
                   style={{ boxShadow: 'var(--neon-glow-teal)' }} />
              <div className="absolute -top-1 -right-1 w-16 h-16 border-t-4 border-r-4 border-violet-400 rounded-tr-2xl"
                   style={{ boxShadow: 'var(--neon-glow-violet)' }} />
              <div className="absolute -bottom-1 -left-1 w-16 h-16 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl"
                   style={{ boxShadow: 'var(--neon-glow-teal)' }} />
              <div className="absolute -bottom-1 -right-1 w-16 h-16 border-b-4 border-r-4 border-violet-400 rounded-br-2xl"
                   style={{ boxShadow: 'var(--neon-glow-violet)' }} />

              {/* スキャンライン */}
              <div className="absolute inset-x-4 top-4 h-1 rounded-full animate-scanline"
                   style={{ background: 'var(--gradient-main)', boxShadow: 'var(--neon-glow-teal)' }} />
            </div>
          </div>
        </>
      )}

      {/* ヘッダー（閉じるボタン）- ガラスPill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass"
             style={{ borderColor: 'var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white font-medium"
          >
            閉じる
          </button>
        </div>
      </div>

      {/* ガイダンス（グラデ文字） */}
      {hasPermission === true && (
        <div className="absolute bottom-20 w-full text-center">
          <p className="text-white/90 text-sm sm:text-base">
            <span className="text-gradient-main font-semibold text-lg">QRコード</span>を枠内に合わせてね！
          </p>
        </div>
      )}

      {/* 権限NG時のガラスカード */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="neon-card rounded-3xl p-8 text-white/90 max-w-sm mx-auto text-center">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-pink-400"
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
            <p className="text-xl font-bold mb-3 text-gradient-pop">カメラへのアクセスが必要です</p>
            <p className="text-sm opacity-90">ブラウザ設定からカメラを許可して再読み込みしてください</p>
          </div>
        </div>
      )}

      {/* 権限確認中のローディング */}
      {hasPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-400 border-t-transparent mx-auto mb-4"
                 style={{ boxShadow: 'var(--neon-glow-teal)' }}></div>
            <p className="text-white font-medium">カメラを準備中...</p>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8">
          <div className="glass px-6 py-3 rounded-xl text-white/90 text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}