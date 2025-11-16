import { Phone, Calendar, FileCheck, Clock, CheckCircle, Zap, TrendingUp, Users, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import OnboardingForm from './components/OnboardingForm';
import { supabase } from './lib/supabase';

function App() {
  const [email, setEmail] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setCheckingOnboarding(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowAuth(false);
        checkOnboardingStatus(session.user.id);
      } else {
        setCheckingOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('business_configured')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      setNeedsOnboarding(!data || !data.business_configured);
    } catch (err) {
      console.error('Error checking onboarding:', err);
      setNeedsOnboarding(true);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNeedsOnboarding(false);
  };

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false);
  };

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && needsOnboarding) {
    return <OnboardingForm user={user} onLogout={handleSignOut} onComplete={handleOnboardingComplete} />;
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleSignOut} />;
  }

  if (showAuth) {
    return <AuthPage />;
  }

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you! We'll contact you at ${email}`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">AdminEase</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">How It Works</a>
            <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition">Benefits</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600 transition">FAQ</a>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50 via-slate-100 to-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Automate mundane admin work. Focus on your passion!
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              AI-powered automation that handles your calls, schedules appointments, and organizes documents—so you can focus on what you do best.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg shadow-lg hover:shadow-xl">
                Watch 2-Min Demo
              </button>
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg">
                Learn More
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Trusted by 50+ small businesses</span>
              </div>
              <div className="hidden sm:block">|</div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                <span>Boost revenue by $3,500-$13,000/month</span>
              </div>
            </div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Small business owner looking relaxed"
                  className="rounded-lg shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600">70-90%</div>
                  <div className="text-sm text-gray-600">Calls Captured</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Missing Calls = Missing Revenue
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Small business owners lose 20-30% of potential appointments to no-shows and missed calls
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-gray-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Phone rings while you're with a customer
              </h3>
              <p className="text-gray-600">
                You can't answer—customers take priority
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-gray-200">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                60-70% of callers won't leave voicemail
              </h3>
              <p className="text-gray-600">
                They hang up and move on immediately
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center border border-gray-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                They book with your competitor instead
              </h3>
              <p className="text-gray-600">
                Lost revenue you'll never recover
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Your 24/7 AI Business Assistant—Setup in 15 Minutes
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Get started in three simple steps. No coding required.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Upload Your Business Info
              </h3>
              <p className="text-gray-600 text-center">
                Share your services, pricing, and policies (3-5 documents)
              </p>
              <div className="mt-6 bg-blue-50 p-6 rounded-lg">
                <FileCheck className="w-12 h-12 text-blue-600 mx-auto" />
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                AI Learns Your Business
              </h3>
              <p className="text-gray-600 text-center">
                Our AI understands your specific business—no coding required
              </p>
              <div className="mt-6 bg-blue-50 p-6 rounded-lg">
                <Zap className="w-12 h-12 text-blue-600 mx-auto" />
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Go Live & Relax
              </h3>
              <p className="text-gray-600 text-center">
                Answer calls, book appointments, send reminders—automatically
              </p>
              <div className="mt-6 bg-blue-50 p-6 rounded-lg">
                <CheckCircle className="w-12 h-12 text-blue-600 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-b from-blue-50 to-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Stop Losing Money. Start Growing Your Business.
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            Boost your revenue, reduce no-shows, and reclaim your time
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-200">
              <Phone className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Never Miss Another Call
              </h3>
              <p className="text-gray-600 mb-4">
                Capture 70-90% of missed calls automatically
              </p>
              <div className="text-2xl font-bold text-green-600">
                +$1,000-$5,000/month
              </div>
              <p className="text-sm text-gray-500">Additional revenue captured</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-200">
              <Calendar className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Slash No-Shows by 50%+
              </h3>
              <p className="text-gray-600 mb-4">
                Automated reminders via email, SMS, and voice
              </p>
              <div className="text-2xl font-bold text-green-600">
                +$500-$2,000/month
              </div>
              <p className="text-sm text-gray-500">Revenue protected from reduced no-shows</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-200">
              <CheckCircle className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Book While You Work
              </h3>
              <p className="text-gray-600 mb-4">
                AI schedules appointments during customer calls
              </p>
              <div className="text-sm text-gray-600 font-medium">
                No more phone tag or voicemail black holes
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-200">
              <Clock className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Reclaim 15-20 Hours Weekly
              </h3>
              <p className="text-gray-600 mb-4">
                Eliminate manual reminders, callbacks, and filing
              </p>
              <div className="text-sm text-gray-600 font-medium">
                Equivalent to a half-time employee at 1/10th the cost
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-200">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                24/7 Professional Coverage
              </h3>
              <p className="text-gray-600 mb-4">
                AI answers with your business knowledge
              </p>
              <div className="text-sm text-gray-600 font-medium">
                Never worry about being "off the clock" again
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-200">
              <FileCheck className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Effortless Organization
              </h3>
              <p className="text-gray-600 mb-4">
                Documents auto-organized and tax-ready
              </p>
              <div className="text-sm text-gray-600 font-medium">
                Find any receipt in seconds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            Built for Service Professionals Who Do It All
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16">
            If you're juggling customers and admin tasks, AdminEase is for you
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Salon & Spa Owners',
              'HVAC & Plumbing',
              'Dental & Medical',
              'Pet Groomers',
              'Therapists & Counselors',
              'Personal Trainers',
              'Handymen & Contractors',
              'House Cleaners'
            ].map((profession, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg text-center hover:shadow-lg transition">
                <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <p className="font-semibold text-gray-900">{profession}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-blue-50 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Join Small Businesses Saving 15+ Hours Weekly
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Maria S."
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-gray-900">Maria S.</p>
                  <p className="text-sm text-gray-500">Hair Salon Owner</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "AdminEase captured 18 calls I would have missed last month. That's $4,200 in revenue I almost lost. Now I can focus fully on my clients."
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="James T."
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-gray-900">James T.</p>
                  <p className="text-sm text-gray-500">HVAC Contractor</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Setup took 10 minutes. The AI handles my appointment confirmations and even reschedules when I have emergencies. It's like having a receptionist for $199/month instead of $3,000."
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Sarah L."
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <p className="font-bold text-gray-900">Sarah L.</p>
                  <p className="text-sm text-gray-500">Pet Groomer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "My no-show rate dropped from 28% to 8% in the first month. The automated reminders are a game-changer."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white to-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Simple, Transparent Pricing
          </h2>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-12 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold mb-2">$199/month</div>
              <p className="text-xl text-blue-100">Everything You Need to Run Your Business</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                'Unlimited AI call answering',
                'Smart appointment scheduling',
                'Automated reminders (email/SMS/voice)',
                'Document organization',
                'Call recordings & transcripts',
                '24/7 coverage',
                'Setup in 15 minutes',
                'Google Calendar integration'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <button className="px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-lg">
                Get Started Today
              </button>
              <p className="text-sm text-blue-100 mt-4">Setup in 15 minutes • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            Common Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'How long does setup take?',
                a: 'About 15 minutes. Upload your business information, connect your calendar, and you\'re live.'
              },
              {
                q: 'Will the AI sound robotic?',
                a: 'No. Our AI uses natural conversation and learns your business-specific terminology. Customers often don\'t realize they\'re speaking with AI.'
              },
              {
                q: 'What if the AI doesn\'t know an answer?',
                a: 'It takes a message and immediately notifies you. You can also update its knowledge base anytime.'
              },
              {
                q: 'Can I customize what the AI says?',
                a: 'Yes! Upload your policies, FAQs, and service details. The AI adapts to your business voice.'
              },
              {
                q: 'What calendars do you integrate with?',
                a: 'Google Calendar currently, with more integrations coming soon.'
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. We use enterprise-grade encryption and never share your data.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow border border-gray-200">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 px-6">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to Get Your Time Back?
          </h2>
          <p className="text-2xl mb-8 text-blue-100">
            Join 50+ small businesses saving 15-20 hours weekly
          </p>
          <form onSubmit={handleWaitlist} className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold shadow-lg"
              >
                Get Started
              </button>
            </div>
          </form>
          <p className="text-blue-100">
            Setup in 15 minutes • Cancel anytime
          </p>
          <div className="mt-12">
            <img
              src="https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Happy business owner with family"
              className="rounded-lg shadow-2xl mx-auto max-w-2xl"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6" />
                <span className="text-xl font-bold">AdminEase</span>
              </div>
              <p className="text-gray-400">
                AI-powered freedom for small business owners
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#benefits" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <p className="text-gray-400 mb-4">support@adminease.com</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 AdminEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
