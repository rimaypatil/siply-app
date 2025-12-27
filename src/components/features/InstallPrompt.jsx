import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom-5">
            <div className="flex flex-col">
                <span className="font-semibold">Install App</span>
                <span className="text-xs text-slate-400">Add to home screen for offline use</span>
            </div>
            <Button size="sm" onClick={handleInstall} className="bg-brand-500 hover:bg-brand-400 text-white border-none h-9">
                <Download className="mr-2 w-4 h-4" /> Install
            </Button>
        </div>
    );
}
