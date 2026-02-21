import React, { useState } from 'react';
import { Globe, Users, Zap, Shield, Heart, Star, Menu, X } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-400 mr-3" />
              <h1 className="text-2xl font-bold text-white">HeadyWeb</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-white hover:text-blue-300 transition-colors">Home</a>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">About</a>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">Services</a>
              <a href="#" className="text-white hover:text-blue-300 transition-colors">Contact</a>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-6">
            Welcome to HeadyWeb
          </h2>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            The main web platform for Heady Systems - connecting AI, humanity, and technology for maximum global happiness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Zap className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-purple-200">Optimized performance for seamless user experience across all devices.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Shield className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Secure Platform</h3>
            <p className="text-purple-200">Enterprise-grade security to protect your data and privacy.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Community Driven</h3>
            <p className="text-purple-200">Built with love for our global community of users and developers.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Heart className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Social Impact</h3>
            <p className="text-purple-200">Focused on creating maximum global happiness through technology.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Star className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">AI Powered</h3>
            <p className="text-purple-200">Leveraging cutting-edge AI to enhance user experience.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <Globe className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Global Reach</h3>
            <p className="text-purple-200">Connecting people and ideas across the entire planet.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Our Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">1M+</div>
              <div className="text-purple-200">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">150+</div>
              <div className="text-purple-200">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">99.9%</div>
              <div className="text-purple-200">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
              <div className="text-purple-200">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/20 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-6 h-6 text-blue-400 mr-2" />
            <span className="text-white font-semibold">HeadyWeb</span>
          </div>
          <p className="text-purple-200 text-sm">
            Maximum Global Happiness through AI-Powered Social Impact
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
