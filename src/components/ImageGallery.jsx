export default function ImageGallery({ title, photos, selected, onToggle, onSelectAll }) {
    const allSelected = selected.length === photos.length;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                    onClick={onSelectAll}
                    className="text-sm text-blue-600 hover:underline font-medium"
                >
                    {allSelected ? 'Unselect All' : 'Select All'}
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                    <div
                        key={idx}
                        className={`relative group cursor-pointer border-4 rounded-md overflow-hidden transition-all duration-200 ${selected.includes(url) ? 'border-blue-500' : 'border-transparent'
                            }`}
                        onClick={() => onToggle(url)}
                    >
                        <img
                            src={url}
                            alt={`photo_${idx}`}
                            className="w-full h-44 object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
                            <input
                                type="checkbox"
                                checked={selected.includes(url)}
                                onChange={() => onToggle(url)}
                                className="accent-blue-600 w-4 h-4"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
