const Modal = ({ city, onClose }) => {
    if (!city) return null;

    return (
        <div
            className="fixed inset-0 bg-black/20 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-pink-400 to-pink-500 p-3 relative">
                    <div className="flex justify-center">
                        <div className="p-3 inline-block">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-semibold text-gray-800">POLARIS</span>
                                <span className="text-xl font-semibold text-gray-800">-</span>
                                <span className="text-xl font-semibold text-gray-800">COMMUNEX</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 gap-1 mb-8">
                        <div className="bg-blue-50 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-blue-600 font-medium">Region: {city.name}</span>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-green-600 font-medium">Active Subnets: {city.subnets}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:from-pink-600 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-pink-500/20 font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;