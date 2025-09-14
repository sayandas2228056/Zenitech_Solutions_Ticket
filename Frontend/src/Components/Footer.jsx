import React from 'react';
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
} from 'react-icons/fa';
import {
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineLocationMarker,
} from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white px-6 md:px-10 py-16 text-sm font-light">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {/* Logo + Description */}
        <div>
          <h1 className="text-4xl font-bold mb-4 tracking-wide whitespace-nowrap">
            <span className="text-orange-500">Zenitech </span>
            <span className="text-blue-500">Solutions</span>
          </h1>
          <p className="text-gray-300 max-w-xs">
            Innovative IT Services Designed to Modernize, Protect, and Propel Your Business Forward.
          </p>
          <div className="flex space-x-4 mt-4 text-lg">
            <a href="https://www.facebook.com/zenitechsolutions" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400"><FaFacebookF /></a>
            <a href="https://twitter.com/zenitechsolutions" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400"><FaTwitter /></a>
            <a href="https://www.instagram.com/zenitechsolutions" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400"><FaInstagram /></a>
            <a href="https://www.linkedin.com/company/zenitech-solutions" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Updated Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="/dashboard" className="hover:text-orange-400">Dashboard</a></li>
            <li><a href="/token" className="hover:text-orange-400">Raise a Token</a></li>
            <li><a href="/login" className="hover:text-orange-400">Sign In</a></li>
            <li><a href="/signup" className="hover:text-orange-400">Create New Account</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-4">Contact</h3>
          <ul className="space-y-4 text-gray-300">
            <li className="flex items-start">
              <HiOutlineLocationMarker className="mt-1 mr-2 text-lg" />
              <a href="https://www.google.com/maps?q=Dex+Co+Work,+2nd+Floor,+1383/433,+HBR+Layout,+Bangalore+-+560045,+India" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">
                Dex Co Work, 2nd Floor, 1383/433, HBR Layout, Bengaluru - 560045
              </a>
            </li>
            <li className="flex items-start">
              <HiOutlineLocationMarker className="mt-1 mr-2 text-lg" />
              <a href="https://www.google.com/maps?q=Sunny+Seasons,+15/1C,+Kamalgazi,+P.O.+Narendrapur,+Kolkata,+West+Bengal+700103,+IN" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400">
                Sunny Seasons, 15/1C, Kamalgazi, P.O Narendrapur, Kolkata - 700103
              </a>
            </li>
            <li className="flex items-center">
              <HiOutlineMail className="mr-2 text-lg" />
              <a href="mailto:info@zenitech.in" className="hover:text-orange-400">info@zenitech.in</a>
            </li>
            <li className="flex items-center">
              <HiOutlinePhone className="mr-2 text-lg" />
              <a href="tel:+918820066999" className="hover:text-orange-400">+91 88200 66999</a>
            </li>
            <li className="flex items-center">
              <HiOutlinePhone className="mr-2 text-lg" />
              <a href="tel:+917439004545" className="hover:text-orange-400">+91 74390 04545</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-10 border-t border-gray-700 pt-6 px-6 sm:px-12 text-gray-400 text-xs sm:text-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="mb-2 sm:mb-0 text-center sm:text-left">
            © <span className="text-orange-400 font-semibold">Zenitech</span><span className="text-blue-400 font-semibold"> Solutions</span>, All rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Made by{' '}
           
              <span className="text-orange-400 font-semibold">Zenitech </span><span className="text-blue-400 font-semibold">Solution</span>
            
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;