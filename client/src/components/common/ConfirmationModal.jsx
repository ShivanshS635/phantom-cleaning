import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger", // danger, warning, info
    isLoading = false
}) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="h-6 w-6 text-red-600" />;
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
            case 'info':
            default:
                return <Info className="h-6 w-6 text-blue-600" />;
        }
    };

    // const getButtonColor = () => {
    //     switch (type) {
    //         case 'danger':
    //             return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
    //         case 'warning':
    //             return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
    //         case 'info':
    //         default:
    //             return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
    //     }
    // };
    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">

                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-ink-primary/30 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-surface-0 rounded-xl text-left overflow-hidden shadow-float transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-surface-3 animate-fade-up">
                    <div className="px-5 pt-6 pb-5 sm:p-6 sm:pb-5">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${type === 'danger' ? 'bg-red-50 text-red-600' :
                                type === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-brand-50 text-brand-600'
                                }`}>
                                {getIcon()}
                            </div>
                            <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-semibold text-ink-primary" id="modal-title">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-ink-secondary">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-surface-3 bg-surface-1 px-5 py-4 sm:px-6 flex flex-col sm:flex-row-reverse gap-3">
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onConfirm}
                            className={`w-full sm:w-auto ${type === 'danger' ? 'btn-danger' : 'btn-primary'} shadow-sm text-sm`}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </button>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onClose}
                            className="w-full sm:w-auto btn-secondary text-sm"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}