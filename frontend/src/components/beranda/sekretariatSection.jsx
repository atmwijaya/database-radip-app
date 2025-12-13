import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaWhatsapp,
  FaExternalLinkAlt,
} from "react-icons/fa";

const SekretariatSection = () => {
  const adminPhoneNumber = "6281234567890";
  const adminName = "Admin Database";

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Halo ${adminName}, saya ingin bertanya tentang sekretariat Racana Diponegoro.`
    );
    window.open(`https://wa.me/${adminPhoneNumber}?text=${message}`, "_blank");
  };

  const googleMapsEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.619420822969!2d110.4358319757659!3d-7.053926669126158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708d37f241bf19%3A0x251d6e594316473b!2sPangkalan%20Pramuka%20UNDIP%20(UKM%20Racana%20Diponegoro)!5e0!3m2!1sid!2sid!4v1765596691719!5m2!1sid!2sid`;

  const googleMapsAppUrl = "https://maps.app.goo.gl/cuWJR5cTCSSpzp6o6";
  const googleMapsWebUrl =
    "https://www.google.com/maps/place/Pangkalan+Pramuka+UNDIP+(UKM+Racana+Diponegoro)/@-7.0539267,110.435832,17z/data=!3m1!4b1!4m6!3m5!1s0x2e708d37f241bf19:0x251d6e594316473b!8m2!3d-7.053932!4d110.4384069!16s%2Fg%2F11l6zt3jt4?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D";

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Alamat Sekretariat",
      content:
        "Gedung Student Center Lt. 2\nUniversitas Diponegoro\nJl. Prof. Soedarto, SH, Tembalang\nSemarang, Jawa Tengah 50275",
      action: "Buka di Google Maps",
      link: `https://maps.app.goo.gl/cuWJR5cTCSSpzp6o6`,
    },
    {
      icon: <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "WhatsApp Sekretariat",
      content: [
        { number: "+62 812-1545-2982", label: "Narahubung Putra" },
        { number: "+62 821-3676-1312", label: "Narahubung Putri" },
      ],
      action: "Kirim Pesan",
    },
    {
      icon: <FaEnvelope className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Email Sekretariat",
      content: "sekreradip@gmail.com",
      action: "Kirim Email",
      link: "mailto:sekretariat@racanadiponegoro.ac.id",
    },
    {
      icon: <FaClock className="w-4 h-4 sm:w-5 sm:h-5" />,
      title: "Jam Operasional",
      content:
        "Senin - Kamis: 08:00 - 16:00 WIB\nJumat: 08:00 - 15:00 WIB\nSabtu: 08:00 - 12:00 WIB\nMinggu & Hari Libur: Tutup",
      action: null,
      link: null,
    },
  ];

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Sekretariat & Kontak Racana Diponegoro
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
            Kunjungi sekretariat kami atau hubungi melalui berbagai saluran
            komunikasi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Informasi Kontak */}
          <div className="space-y-4 sm:space-y-6">
            {contactInfo.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 active:scale-[0.98]"
              >
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="text-blue-600 mt-0.5 sm:mt-1 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                      {item.title}
                    </h3>

                    {/* LOGIC BARU: Cek jika content berupa array */}
                    {Array.isArray(item.content) ? (
                      <div className="space-y-2 mb-3">
                        {item.content.map((contact, contactIndex) => {
                          const cleanNumber = contact.number.replace(/\D/g, "");
                          const whatsappLink = `https://wa.me/${cleanNumber}`;
                          const message = encodeURIComponent(
                            `Halo ${contact.label}, saya ingin bertanya tentang Racana Diponegoro.`
                          );
                          const whatsappLinkWithMessage = `${whatsappLink}?text=${message}`;

                          return (
                            <div
                              key={contactIndex}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div>
                                <div className="text-gray-700 font-medium text-sm sm:text-base">
                                  {contact.number}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {contact.label}
                                </div>
                              </div>
                              <a
                                href={whatsappLinkWithMessage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-xs sm:text-sm transition-colors bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg"
                              >
                                <FaWhatsapp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                                Kirim Pesan
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base mb-3">
                          {item.content}
                        </p>
                        {item.action && item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm transition-colors"
                          >
                            {item.action}
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Peta Lokasi dengan Google Maps Embed */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                Lokasi Sekretariat
              </h3>

              {/* Google Maps Embed */}
              <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 rounded-lg overflow-hidden border border-gray-300 mb-4">
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Sekretariat Racana Diponegoro"
                  className="absolute inset-0"
                />
              </div>

              {/* Tombol Buka di Maps - DIPINDAHKAN KE SINI */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
                <a
                  href={googleMapsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors flex-1 text-center"
                >
                  <FaExternalLinkAlt className="w-3 h-3 mr-1.5" />
                  Buka di App Maps
                </a>
                <a
                  href={googleMapsWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-gray-700 hover:text-gray-900 font-medium text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors flex-1 text-center"
                >
                  <FaExternalLinkAlt className="w-3 h-3 mr-1.5" />
                  Buka di Browser
                </a>
              </div>

              <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="truncate">
                    Gedung Student Center Lt. 2, Universitas Diponegoro
                  </span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <FaClock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-2 flex-shrink-0" />
                  <span>Buka Senin-Jumat 08:00-16:00 WIB</span>
                </div>
              </div>
            </div>

            {/* Container kosong untuk menjaga layout (opsional) */}
            <div className="hidden sm:block">
              {/* Container ini bisa diisi dengan konten lain di masa depan, atau dihapus */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SekretariatSection;
