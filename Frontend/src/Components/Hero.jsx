import React from 'react';
import Bgpic from '../assets/images/Picbg.jpeg';

const Hero = () => {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${Bgpic})` }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a1a1a88] to-black/60 mix-blend-multiply "></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-start h-full px-6 md:px-24 text-white">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          <span className="text-orange-500">Zenitech </span>
          <span className="text-blue-600">Solutions</span>
          <br />
          <span className="text-white">Ready to Solve Your Problem</span>
        </h1>

        <a href="/token">
          <button className="bg-white text-black px-8 py-3 rounded-full text-base font-semibold flex items-center gap-2 shadow-md hover:shadow-xl hover:bg-blue-100 hover:scale-105 transition-all duration-300">
            Raise an Issue <span className="text-xl">➔</span>
          </button>
        </a>

        <div className="mt-8 max-w-xl text-lg md:text-base text-gray-200 space-y-2  p-4 rounded-xl shadow-md">
          <p>
            Zenitech Solutions is a leading provider of{' '}
            <span className="text-orange-400 font-semibold">IT Services</span>,{' '}
            <span className="text-orange-400 font-semibold">Cyber Security</span>,{' '}
            <span className="text-orange-400 font-semibold">Cloud Computing</span>,{' '}
            <span className="text-orange-400 font-semibold">Software Solutions</span> and{' '}
            <span className="text-orange-400 font-semibold">Telecom Services</span>.
          </p>
          <p>
            Corporate Office: <span className="text-orange-400 font-semibold">Bengaluru, India</span>
          </p>
          <p>
            Serving Clients <span className="text-orange-400 font-semibold">Pan India</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;