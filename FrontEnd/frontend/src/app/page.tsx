import Link from 'next/link'
import RandomBackdrop from './components/background';

export default function Home() {
  return (
    <div>
      <main className="min-h-screen bg-[url(/paper.jpg)] p-8">
      
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto py-20">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-6xl font-black text-black">
             (base) ////PANDERA @UCSD ~ %
            </h1>
            <p className="text-xl text-gray-600 max-w-1xl">
              Data Science. High Performance Compute. Econometrics. Mathematical Puzzles.
            </p>
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-gray-200 from-30% to-fuchsia-200 text-gray-600 text-lg font-semibold transition-all duration-300 shadow-[2px_2px_4px_#bebebe] hover:shadow-inner">
              <Link href="/models">Explore Our Work</Link>
            </button>
          </div>
        </section>

        {/* About Us Section */}
        <section className="mx-auto py-20" style={{ zIndex: 2}}>
        <h2 className="text-4xl font-bold text-black">
                ABOUT US
              </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center bg-gradient-to-r from-yellow-100 from-10% via-emerald-100 to-blue-100 to-90% text-gray-600 p-12">
            <div className="space-y-6">
              
              <div className="p-6 bg-white shadow-[8px_8px_16px_rgba(0,0,0,0.2)]">
            </div>
              
            </div>
            <div className="p-6 bg-white shadow-[8px_8px_16px_rgba(0,0,0,0.2)]">
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
