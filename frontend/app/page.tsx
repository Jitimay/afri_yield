import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center max-w-4xl">
        <h1 className="text-6xl font-bold mb-4 text-primary-600">
          AfriYield
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300 mb-8">
          AI-Powered Micro-Lending Platform
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
          Empowering smallholder farmers in East Africa with instant micro-loans through AI-driven risk assessment
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/farmer" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">🌾</div>
            <h2 className="text-xl font-semibold mb-2">Farmer Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get AI credit scoring and request micro-loans
            </p>
          </Link>

          <Link href="/lender" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">💰</div>
            <h2 className="text-xl font-semibold mb-2">Lender Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Deposit funds and earn 8% APY
            </p>
          </Link>

          <Link href="/transparency" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">Transparency</h2>
            <p className="text-gray-600 dark:text-gray-400">
              View all loans and platform statistics
            </p>
          </Link>
        </div>

        <div className="bg-primary-100 dark:bg-primary-900/20 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✓ AI-powered risk assessment based on farm data</li>
            <li>✓ Instant micro-loans (50-500 AUSD) for eligible farmers</li>
            <li>✓ Fixed 8% APY for lenders</li>
            <li>✓ Complete transparency with on-chain loan data</li>
            <li>✓ Built on Moonbase Alpha (Polkadot testnet)</li>
          </ul>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Testnet Demo • Moonbase Alpha • Built with ❤️ for East African farmers</p>
        </div>
      </div>
    </main>
  );
}
