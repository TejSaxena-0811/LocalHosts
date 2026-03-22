import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfoModal from './InfoModal';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-12">
      
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-bold text-indigo-400">Protego</h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
          Identify, analyze, and eliminate risks from your system design, beautifully and efficiently.
        </p>

        {/* Lottie Animation */}
        <div className="w-64 h-64 mx-auto hover:scale-105 transition-transform">
          {/* <Lottie animationData={secureAnim} loop /> */}
          <img src="/logo/raptor_image.png" alt="raptor" className="mx-auto hover:scale-105 transition-transform animate-pulseScale"/>
        </div>
        <br /><br /><br /><br />

        {/* CTA Buttons */}
        <div className="flex gap-6 mt-2 mb-10">
          {/* actual working button: */}
          <button
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl text-lg font-semibold text-white transition shadow-lg hover:shadow-indigo-400/30"
            onClick={() => navigate('/threats')}
          >
            Get Started <ArrowRightIcon className="h-5 w-5 inline ml-2" />
          </button>

          {/* disabled button */}
          {/* <button
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-3 rounded-xl text-lg font-semibold text-white transition shadow-lg hover:shadow-indigo-400/30"
          >
            Get Started <ArrowRightIcon className="h-5 w-5 inline ml-2" />
          </button> */}
          <button
            className="border border-indigo-400 text-indigo-300 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-indigo-800 transition"
            onClick={() => setShowModal(true)}
          >
            Learn More
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-6">
          {[
            {
              title: "⚡ Rapid Threat Modeling",
              desc: "Define product specs and get threat models instantly."
            },
            {
              title: "🔒 Security by Design",
              desc: "Incorporate security at architecture level with smart diagrams."
            },
            {
              title: "🎯 AI-Assisted Insights",
              desc: "Get suggestions and vulnerabilities based on real models."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800 shadow-md border border-slate-700 rounded-xl p-6 hover:scale-105 transition-transform"
            >
              <h3 className="text-xl font-bold text-indigo-300 mb-2">{feature.title}</h3>
              <p className="text-slate-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <br /><br />

        {/* Trusted By Logos */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-4 text-slate-200">Trusted by</h2>
          <br />
          {/* <div className="flex justify-center gap-8 grayscale hover:grayscale-0 transition"> */} 

          {/* testing logos: */}
          {/* <div className="flex justify-center gap-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-12 w-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-12 w-auto" />
            <img src="https://cdn.worldvectorlogo.com/logos/ibm.svg" alt="IBM" className="h-12 w-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" alt="AWS" className="h-12 w-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" alt="Netflix" className="h-12 w-auto" />
          </div> */}


          <div className="flex justify-center gap-8">
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Ikea_logo.svg" alt="IKEA" className="h-12 w-auto" />
            <img src="https://www.capgemini.com/wp-content/themes/capgemini2020/assets/images/logo.svg" alt="Capgemini" className="h-12 w-auto"/>
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/BHEL_logo.svg" alt="BHEL" className="h-12 w-auto" />
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Godrej_Logo.svg" alt="Godrej" className="h-12 w-auto" />
            <img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Siemens-logo.svg" alt="Siemens" className="h-12 w-auto" />
          </div>


        </div>

        <br /><br />

        {/* Testimonials */}
        <div className="mt-20 max-w-5xl mx-auto text-center space-y-8">
          <h2 className="text-2xl font-semibold text-slate-100">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Alex Johnson", text: "Protego made our threat modeling 3x faster and incredibly intuitive!" },
              { name: "Maria Lee", text: "As a startup CTO, this tool saves hours. Highly recommended." },
              { name: "John Doe", text: "Clear diagrams and AI suggestions made our architecture much safer." }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-800 rounded-xl shadow-md p-4 border border-slate-700 hover:scale-105 transition-transform"
              >
                <p className="text-slate-300 italic">"{testimonial.text}"</p>
                <p className="mt-2 text-sm font-semibold text-indigo-300">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>

        <br /><br />

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto space-y-6 text-left">
          <h2 className="text-2xl font-semibold text-center text-slate-100">Frequently Asked Questions</h2>
          {[
            { q: "Is Protego free to use?", a: "Yes, Protego offers a free tier with all core features accessible." },
            { q: "Do I need technical skills?", a: "No, Protego is designed to be user-friendly for all skill levels." },
            { q: "Can I export diagrams?", a: "Yes, you can export PlantUML, PNG, and other formats easily." }
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl shadow-md p-4 border border-slate-700 hover:scale-105 transition-transform"
            >
              <h3 className="font-semibold text-indigo-300">{faq.q}</h3>
              <p className="text-slate-300 mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <InfoModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Footer */}
      <footer className="mt-20 text-center text-sm text-slate-500">
        © 2026 Protego. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
