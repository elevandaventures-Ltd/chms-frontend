/** @type {import('next').NextConfig} */
const nextConfig = {
	// Allow hosts that will access the dev server from the local network
	// Add any IPs your device uses on the LAN so webpack HMR requests are permitted.
	allowedDevOrigins: ['192.168.1.9', '192.168.1.10'],
};

export default nextConfig;