import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-95 transition-transform duration-100';

    const variants = {
        primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-md shadow-brand-500/20',
        secondary: 'bg-white text-brand-900 border-2 border-brand-100 hover:border-brand-200 focus:ring-brand-200',
        ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 focus:ring-brand-200',
        outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900'
    };

    const sizes = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-2',
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}
