import { useState } from 'react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { BookingForm } from './components/BookingForm';
import { Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';
import logoImage from '../imports/Logo.jpeg';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from '../lib/auth';
import BookingSuccess from '../pages/BookingSuccess';
import BookingCancelled from '../pages/BookingCancelled';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from '../components/admin/ProtectedRoute';


function MainPage(){
 const [showBooking, setShowBooking] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={logoImage}
                alt="Thee Colon Clinic Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="text-xl text-primary">Thee Colon Clinic</span>
            </div>
            <div className="hidden md:flex gap-8">
              <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
            </div>
            <button
              onClick={() => setShowBooking(true)}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/30 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <ImageWithFallback
              src={logoImage}
              alt="Thee Colon Clinic"
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl text-primary mb-4">THEE COLON CLINIC</h1>
          <p className="text-2xl text-muted-foreground mb-12">Cleanse · Heal · Thrive</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowBooking(true)}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg"
            >
              Book Your Session
            </button>
            <a
              href="#services"
              className="border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors text-lg"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-primary mb-6">About Us</h2>
            <p className="text-lg text-foreground leading-relaxed">
              Thee Colon Clinic offers professional Colon Hydrotherapy services in a clean and serene environment.
              We are dedicated to assisting individuals struggling with constipation, IBS, and other digestive challenges.
              Our mission is to help you live healthier, more comfortable, and balanced lives through natural cleansing
              and holistic wellness practices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-secondary rounded-lg">
              <h3 className="text-xl text-primary mb-3">Our Vision</h3>
              <p className="text-foreground">
                To be a trusted wellness destination for optimal digestive health and holistic balance.
              </p>
            </div>
            <div className="text-center p-6 bg-secondary rounded-lg">
              <h3 className="text-xl text-primary mb-3">Our Mission</h3>
              <p className="text-foreground">
                To provide safe, compassionate, and effective colon hydrotherapy for lasting wellness.
              </p>
            </div>
            <div className="text-center p-6 bg-secondary rounded-lg">
              <h3 className="text-xl text-primary mb-3">Our Values</h3>
              <div className="text-foreground space-y-1">
                <p>Compassion</p>
                <p>Integrity</p>
                <p>Wellness</p>
                <p>Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-primary text-center mb-12">Our Services</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl text-primary mb-4">Colon Hydrotherapy</h3>
              <p className="text-foreground mb-4">
                Gentle and effective cleansing for digestive health.
              </p>
              <ul className="space-y-2 text-foreground">
                <li>• Private, comfortable sessions (30-45 minutes)</li>
                <li>• Warm, filtered water gently flushes the colon</li>
                <li>• Relief from fullness, bloating, or mild cramping</li>
                <li>• Professional guidance throughout</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl text-primary mb-4">Wellness Consultations</h3>
              <p className="text-foreground mb-4">
                Personalized guidance for gut health.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl text-primary mb-4">Detox Programs</h3>
              <p className="text-foreground mb-4">
                Tailored plans to eliminate toxins and restore vitality.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <h3 className="text-2xl text-primary mb-6">Benefits</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-foreground">Supports digestion & relieves constipation</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-foreground">Promotes detoxification & nutrient absorption</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-foreground">Boosts energy, clarity and vitality</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-foreground">Encourages balanced gut health</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-foreground">May improve skin and immune resilience</p>
              </div>
            </div>
          </div>

          {/* Contraindications */}
          <div className="bg-amber-50 border border-amber-200 p-8 rounded-lg">
            <h3 className="text-2xl text-amber-900 mb-4">Important Information</h3>
            <p className="text-amber-900 mb-4">Colon hydrotherapy is not suitable for:</p>
            <ul className="space-y-2 text-amber-900">
              <li>• Inflammatory bowel disease (Crohn's, ulcerative colitis)</li>
              <li>• Severe hemorrhoids or rectal bleeding</li>
              <li>• Recent abdominal/colon surgery</li>
              <li>• Pregnancy</li>
              <li>• Diverticulitis, tumors, severe heart/kidney disease</li>
              <li>• Uncontrolled hypertension or aneurysm</li>
            </ul>
            <p className="mt-4 text-amber-900 italic">
              "The treatment is not painful, neither is it smelly or embarrassing. It's a CLEAN NEAT process."
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl text-primary text-center mb-4">Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">New Year Price List — 2026</p>

          <div className="bg-secondary/50 rounded-lg p-8 mb-8">
            <h3 className="text-2xl text-primary mb-6">Colon Hydrotherapy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-foreground">Initial Colon Hydrotherapy Consultation and treatment</span>
                <span className="text-primary">R750</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-foreground">Follow-up Session</span>
                <span className="text-primary">R650</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-foreground">Colon Hydrotherapy package x4 sessions</span>
                <span className="text-primary">R2500</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-foreground">Package of 6 sessions</span>
                <span className="text-primary">R3750</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-8">
            <h3 className="text-2xl text-primary mb-6">Massage Therapy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-foreground">Full Body Massage 60min</span>
                <span className="text-primary">R550</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-foreground">30min add on or half body massage</span>
                <span className="text-primary">R350</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowBooking(true)}
              className="bg-primary text-primary-foreground px-10 py-4 rounded-lg hover:bg-primary/90 transition-colors text-lg"
            >
              Book Your Appointment
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl text-center mb-12">Contact Us</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <p>Margo Billett</p>
                    <a href="tel:0787363323" className="hover:underline">078 736 3323</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <a href="mailto:info@theecolonclinic.co.za" className="hover:underline">
                      info@theecolonclinic.co.za
                    </a>
                    <br />
                    <a href="mailto:theecolonclinic@yahoo.com" className="hover:underline">
                      theecolonclinic@yahoo.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <p>169 Fordyce Rd</p>
                    <p>Walmer, Port Elizabeth</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <a
                  href="#"
                  className="w-12 h-12 bg-primary-foreground text-primary rounded-full flex items-center justify-center hover:bg-primary-foreground/90 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 bg-primary-foreground text-primary rounded-full flex items-center justify-center hover:bg-primary-foreground/90 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Preferred contact method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Preferred contact method
              </label>
              <div className="flex gap-4">
                {['Email', 'WhatsApp', 'Phone call'].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="contactMethod"
                      value={method}
                      className="text-primary"
                    />
                    <span className="text-sm text-foreground">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-primary-foreground text-foreground p-8 rounded-lg">
              <h3 className="text-2xl text-primary mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block mb-2 text-foreground">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-md border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-foreground">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 rounded-md border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-foreground">Message</label>
                  <textarea
                    className="w-full px-4 py-2 rounded-md border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring h-24"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                {/* WhatsApp Contact Item */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#25D366"
                      className="w-6 h-6"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.526 5.845L.057 23.571a.75.75 0 00.943.899l5.994-1.58A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.711 9.711 0 01-4.964-1.362l-.355-.211-3.685.970.988-3.607-.231-.371A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    
                    <a  href="https://wa.me/27787363323"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      +27 78 736 3323
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Send Message
                </button>
              </form>
              {/* Floating WhatsApp Button */}
                <a  href="https://wa.me/27787363323?text=Hi%20Margo%2C%20I%27d%20like%20to%20find%20out%20more%20about%20your%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20BA5A] transition-all hover:scale-105 group"
                  aria-label="Chat on WhatsApp"
                >
                  {/* WhatsApp SVG Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 flex-shrink-0"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.526 5.845L.057 23.571a.75.75 0 00.943.899l5.994-1.58A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.711 9.711 0 01-4.964-1.362l-.355-.211-3.685.970.988-3.607-.231-.371A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                  </svg>

                  {/* Label that shows on hover on desktop */}
                  <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
                    Chat with us
                  </span>
                </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2026 Thee Colon Clinic. All rights reserved.</p>
          <p className="mt-2 text-sm opacity-75">Cleanse · Heal · Thrive</p>
        </div>

        <div className="text-center mt-8 pt-4 border-t border-white/10">
          <p className="text-xs text-white/30">
            © 2026 The Colon Clinic
            <span className="mx-2">·</span>
            
            <a  href="/admin/login"
              className="hover:text-white/50 transition-colors"
            >
              Staff Login
            </a>
          </p>
        </div>

      </footer>

      {/* Booking Modal */}
      {showBooking && (
        <BookingForm onClose={() => setShowBooking(false)} />
      )}
    </div>
  );


}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                   element={<MainPage />} />
          <Route path="/booking-success"    element={<BookingSuccess />} />
          <Route path="/booking-cancelled"  element={<BookingCancelled />} />
          <Route path="/admin/login"        element={<AdminLogin />} />
          <Route path="/admin/dashboard"    element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
