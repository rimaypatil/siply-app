import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function Welcome() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 text-center bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/welcome-bg.png')" }}
        >
            {/* Overlay to ensure text readability if needed, though the image looks light enough. 
          Let's add a very subtle white overlay just in case. */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>

            {/* Floating Bubbles (Keep these as they are cute) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                <div className="absolute top-[20%] left-[10%] w-4 h-4 bg-blue-200/40 rounded-full animate-bounce duration-[3000ms]"></div>
                <div className="absolute top-[60%] right-[15%] w-6 h-6 bg-cyan-200/40 rounded-full animate-bounce duration-[4000ms]"></div>
                <div className="absolute bottom-[20%] left-[20%] w-3 h-3 bg-brand-200/30 rounded-full animate-bounce duration-[5000ms]"></div>
            </div>

            <div className="z-20 flex flex-col items-center space-y-8 max-w-md w-full animate-in fade-in duration-1000 slide-in-from-bottom-5">

                {/* Hero Character */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-xl transform scale-110 group-hover:scale-125 transition-transform duration-700"></div>
                    <img
                        src="/cute-cat-water.png"
                        alt="Cute Cat Drinking Water"
                        className="w-64 h-64 object-contain relative drop-shadow-xl transform transition-transform duration-700 hover:scale-105 hover:rotate-2"
                    />
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight font-sans">
                        Stay <span className="text-brand-500">Hydrated</span>,<br />
                        <span className="text-cyan-500">Cutiee!</span> 💧
                    </h1>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xs mx-auto">
                        Your cute hydration buddy that reminds you to drink water and build healthy habits effortlessly.
                    </p>
                </div>

                {/* CTA Button */}
                <div className="w-full pt-4 px-4">
                    <Button
                        onClick={() => navigate('/setup')}
                        className="w-full h-14 text-xl rounded-full bg-gradient-to-r from-brand-400 to-cyan-500 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-300 border-none text-white font-bold tracking-wide"
                    >
                        Get Started
                    </Button>
                </div>

            </div>
        </div>
    );
}
