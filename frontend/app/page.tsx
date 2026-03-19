import Link from 'next/link';
import NetworkStatus from '@/components/NetworkStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-8">
              🌍 Empowering East African Farmers on Polkadot Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-6">
              AfriYield
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              AI-Powered Micro-Lending Platform
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Instant micro-loans for smallholder farmers through intelligent risk assessment on Polkadot Hub (Paseo)
            </p>
            
            {/* Network Status */}
            <div className="max-w-md mx-auto mb-8">
              <NetworkStatus />
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/farmer" className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                🌾 Start as Farmer
              </Link>
              <Link href="/lender" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                💰 Become Lender
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/farmer" className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 rounded-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-3xl">🌾</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Farmer Dashboard</h3>
              <p className="text-gray-600 mb-6">Get AI-powered credit scoring and access instant micro-loans based on your farm data</p>
              <div className="flex items-center text-emerald-600 font-semibold">
                Get Started <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link href="/lender" className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lender Dashboard</h3>
              <p className="text-gray-600 mb-6">Deposit stablecoins and earn fixed 8% APY while supporting farmers</p>
              <div className="flex items-center text-blue-600 font-semibold">
                Start Earning <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link href="/transparency" className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-2xl"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparency Hub</h3>
              <p className="text-gray-600 mb-6">View all platform loans, statistics, and real-time data on-chain</p>
              <div className="flex items-center text-purple-600 font-semibold">
                Explore Data <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50-500</div>
              <div className="text-emerald-100">AUSD Loans</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">8%</div>
              <div className="text-emerald-100">Fixed APY</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">90</div>
              <div className="text-emerald-100">Day Terms</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">AI</div>
              <div className="text-emerald-100">Risk Scoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "AI-powered risk assessment",
              "Instant loan approval",
              "Fixed 8% APY for lenders", 
              "Complete on-chain transparency",
              "Polkadot Hub (Paseo) integration",
              "Secure smart contracts"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm">✓</span>
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">
            Testnet Demo • Polkadot Hub (Paseo) • Built with ❤️ for East African farmers
          </p>
        </div>
      </footer>
    </div>
  );
}
