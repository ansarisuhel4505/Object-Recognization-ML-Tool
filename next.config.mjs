import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Development me disable rakhte hain taaki cache issue na ho
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // 🚀 VERCEL BUILD ERROR FIX
};

export default withPWA(nextConfig);