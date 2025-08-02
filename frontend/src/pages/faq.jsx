import React, { useState } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import { Image, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 pr-4">
          {question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-blue-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fungsi untuk handle klik tombol Hubungi Kami
  const handleContactClick = () => {
    // Ganti dengan nomor WhatsApp yang sesuai (format: kode negara + nomor tanpa tanda + atau 0)
    const phoneNumber = '6281215452982'; 
    const message = 'Halo, saya memiliki pertanyaan tentang Database Anggota Racana Diponegoro';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

// Main FAQ Component
const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const faqData = [
    {
      question: "Apa itu Database Anggota Racana Diponegoro?",
      answer: "Database Anggota Racana Diponegoro adalah sistem informasi yang berisi data lengkap seluruh anggota Racana Diponegoro. Database ini dibuat untuk memudahkan pencarian dan pengelolaan data anggota."
    },
    {
      question: "Bagaimana cara mencari data anggota?",
      answer: "Anda dapat mencari data anggota melalui halaman Database dengan mengetikkan nama lengkap, NIM, nomor induk, fakultas/jurusan, angkatan, atau nama pandega pada kolom pencarian. Sistem akan menampilkan hasil pencarian secara real-time."
    },
    {
      question: "Siapa saja yang dapat mengakses database ini?",
      answer: "Database ini dapat diakses oleh seluruh anggota Racana Diponegoro yang aktif, pengurus, dan alumni. Akses terbatas sesuai dengan tingkat keanggotaan dan keperluan administratif organisasi."
    },
    {
      question: "Bagaimana jika data saya tidak ditemukan atau tidak akurat?",
      answer: "Jika data Anda tidak ditemukan atau terdapat kesalahan informasi, silakan menghubungi pengurus Dewan Racana Diponegoro melalui kontak resmi organisasi. Tim admin akan membantu memperbarui atau menambahkan data Anda ke dalam sistem."
    },
    {
      question: "Apakah data pribadi saya aman dalam database ini?",
      answer: "Ya, keamanan data pribadi anggota adalah prioritas utama kami. Database dilengkapi dengan sistem keamanan yang memadai dan akses terbatas. Data hanya digunakan untuk keperluan internal organisasi dan tidak akan disebarluaskan kepada pihak yang tidak berwenang."
    },
    {
      question: "Apa itu nama pandega dan mengapa tercantum dalam database?",
      answer: "Nama pandega adalah nama kehormatan atau nama panggilan khusus dalam tradisi kepanduan Racana. Nama ini diberikan kepada anggota sebagai identitas dalam kegiatan organisasi dan merupakan bagian penting dari sistem keanggotaan Racana Diponegoro."
    },
    {
      question: "Bagaimana cara memperbarui informasi saya dalam database?",
      answer: "Untuk memperbarui informasi pribadi Anda, silakan menghubungi sekretariat Racana Diponegoro dengan membawa dokumen pendukung yang diperlukan. Perubahan data akan diproses oleh admin setelah verifikasi dokumen."
    },
    {
      question: "Apakah alumni juga tercantum dalam database ini?",
      answer: "Tidak, database ini hanya mencakup data anggota aktif. Alumni tetap tercatat pada buku induk, namun tidak ditampilkan dalam database online."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-blue-600 mb-4">
              <HelpCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan yang sering diajukan seputar Database Anggota Racana Diponegoro
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-3 sm:space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openItems.has(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>

          {/* Contact section */}
          <div className="mt-12 sm:mt-16 text-center">
            <div className="bg-blue-50 rounded-lg p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-900 mb-2 sm:mb-3">
                Masih ada pertanyaan?
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami.
              </p>
              <button onClick={handleContactClick} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 sm:py-3 sm:px-6 rounded-lg transition-colors text-sm sm:text-base">
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FAQ;