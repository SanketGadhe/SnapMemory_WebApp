import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import { Check, Download, Loader2, X } from 'lucide-react';

// Theme Colors
const Colors = {
    primary: '#FF6B6B',       // Coral Red
    primaryDark: '#C44536',   // Deep Sunset
    secondary: '#FFE66D',     // Sunny Yellow
    accent: '#4ECDC4',        // Aqua Mint
    background: '#FFF8F0',    // Warm Beige
    card: '#FFFFFF',
    text: '#2F2F2F',
    muted: '#8D99AE',
    border: '#E0E0E0',
};

export default function PhotoViewer() {
    const { personId } = useParams();
    const [searchParams] = useSearchParams();
    const tripId = searchParams.get('trip');

    const [data, setData] = useState(null);
    const [selected, setSelected] = useState({ selfPhotos: [], groupPhotos: [] });
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`http://192.168.1.40:5000/api/participants/view-photos/${personId}?tripId=${tripId}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error('Error fetching:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [personId, tripId]);

    const togglePhoto = (type, url) => {
        setSelected((prev) => {
            const list = prev[type];
            const exists = list.includes(url);
            return {
                ...prev,
                [type]: exists ? list.filter(p => p !== url) : [...list, url]
            };
        });
    };

    const selectAll = (type, urls) => {
        setSelected((prev) => ({
            ...prev,
            [type]: prev[type].length === urls.length ? [] : urls
        }));
    };

    const downloadSelected = async () => {
        const allUrls = [...selected.selfPhotos, ...selected.groupPhotos];
        if (allUrls.length === 0) {
            setStatusMessage("❗ Please select at least one photo.");
            return;
        }

        setDownloading(true);
        setStatusMessage("⬇️ Downloading photos...");

        for (let i = 0; i < allUrls.length; i++) {
            const url = allUrls[i];
            try {
                const response = await fetch(url, { mode: 'cors' });
                const blob = await response.blob();

                const filename =
                    url.split('/').pop()?.split('?')[0] ||
                    `photo_${i + 1}.${blob.type.split('/')[1] || 'jpg'}`;

                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);

                await new Promise((res) => setTimeout(res, 300));
            } catch (e) {
                console.error("❌ Failed to download", url, e);
            }
        }

        setStatusMessage("✅ All selected photos downloaded.");
        setShowModal(true);
        setDownloading(false);
    };

    if (loading) return <div className="p-6 text-center text-lg animate-pulse text-[${Colors.primaryDark}]">⏳ Loading trip memories...</div>;
    if (!data) return <div className="p-6 text-red-600">⚠️ Something went wrong. Try again later.</div>;

    const totalSelected = selected.selfPhotos.length + selected.groupPhotos.length;

    return (
        <div className="p-4 sm:p-6 max-w-6xl mx-auto" style={{ backgroundColor: Colors.background, color: Colors.text }}>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
                Hey <span style={{ color: Colors.primary }}>{data.name}</span> 👋,
                <br className="sm:hidden" />
                Here are your memories from <span className="font-bold" style={{ color: Colors.accent }}>{data.tripName}</span>
            </h1>

            <ImageGallery
                title="📸 Your Solo Photos"
                photos={data.selfPhotos}
                selected={selected.selfPhotos}
                onToggle={(url) => togglePhoto('selfPhotos', url)}
                onSelectAll={() => selectAll('selfPhotos', data.selfPhotos)}
            />

            <ImageGallery
                title="👥 Group Moments"
                photos={data.groupPhotos}
                selected={selected.groupPhotos}
                onToggle={(url) => togglePhoto('groupPhotos', url)}
                onSelectAll={() => selectAll('groupPhotos', data.groupPhotos)}
            />

            <div className="sticky bottom-0 z-30" style={{ backgroundColor: Colors.card, borderTop: `1px solid ${Colors.border}` }}>
                <div className="backdrop-blur-md mt-6 shadow-inner p-4 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                    <div className="text-center sm:text-left text-sm font-medium" style={{ color: Colors.text }}>
                        🎯 {totalSelected} photo{totalSelected !== 1 && 's'} selected
                        {statusMessage && <div className="text-xs mt-1" style={{ color: Colors.muted }}>{statusMessage}</div>}
                    </div>
                    <button
                        onClick={downloadSelected}
                        disabled={downloading || totalSelected === 0}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold shadow hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        style={{ backgroundColor: Colors.primary, color: Colors.card }}
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5" /> Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" /> Download Selected
                            </>
                        )}
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="rounded-lg p-6 max-w-sm w-full text-center shadow-xl animate-fadeIn" style={{ backgroundColor: Colors.card, color: Colors.text }}>
                        <Check className="mx-auto text-green-500 w-12 h-12 mb-3" />
                        <h2 className="text-xl font-bold" style={{ color: Colors.primary }}>Thanks for using FaceShare!</h2>
                        <p className="mt-2" style={{ color: Colors.muted }}>
                            {totalSelected} photo{totalSelected > 1 ? 's' : ''} are being downloaded. Relive the memories anytime!
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-5 px-5 py-2 rounded-md flex items-center mx-auto hover:scale-105 transition"
                            style={{ backgroundColor: Colors.primary, color: Colors.card }}
                        >
                            <X className="w-4 h-4 mr-1" /> Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
