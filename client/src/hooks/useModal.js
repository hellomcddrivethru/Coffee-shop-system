import { useState, useCallback } from "react";

export function useModal() {
    const [modal, setModal] = useState(null);

    const showModal = useCallback((options) => {
        setModal({
            isOpen: true,
            icon: options.icon || "❓",
            title: options.title || "Confirm Action",
            message: options.message || "Are you sure?",
            confirmText: options.confirmText || "OK",
            cancelText: options.cancelText || "Cancel",
            hideCancel: options.hideCancel || false,
            type: options.type || "confirm",
            onConfirm: options.onConfirm || null,
            onCancel: options.onCancel || null
        });
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, []);

    return { modal, showModal, closeModal };
}