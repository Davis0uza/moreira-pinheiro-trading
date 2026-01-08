import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Location: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="flex flex-col md:flex-row">

            {/* Left: Info */}
            <div className="w-full md:w-1/3 p-10 bg-corporate-900 text-white flex flex-col justify-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-white/10 flex items-center justify-center rounded-sm mb-4">
                  <img
                    src="/logos/mp-logo.jpg"
                    alt="MP Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wider mb-1">Sede Principal</h3>
                <p className="text-slate-400 text-sm">Lisboa, Portugal</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-corporate-accent mt-1" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-300 uppercase mb-1">Morada</h4>
                    <p className="text-gray-200">Av. da Liberdade, 110<br />1250-146 Lisboa<br />Portugal</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-corporate-accent mt-1" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-300 uppercase mb-1">Telefone</h4>
                    <p className="text-gray-200">+351 962 825 921</p>
                    <p className="text-xs text-slate-500 mt-1">Seg-Sex, 9h-18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-corporate-accent mt-1" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-300 uppercase mb-1">Email</h4>
                    <p className="text-gray-200">alex.alves@mptrading.pt</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="w-full md:w-2/3 min-h-[400px] bg-slate-200 relative">
              {/* Using a grayscale filter on the map for corporate look */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.924874771696!2d-9.14777422365851!3d38.71964355716173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19338600000001%3A0x6e7807c48f86f781!2sAv.%20da%20Liberdade%20110%2C%201250-146%20Lisboa!5e0!3m2!1sen!2spt!4v1716300000000!5m2!1sen!2spt"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%)' }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;