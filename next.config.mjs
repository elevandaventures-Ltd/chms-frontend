/** @type {import('next').NextConfig} */
const nextConfig = {
	// Allow hosts that will access the dev server from the local network
	// Add any IPs your device uses on the LAN so webpack HMR requests are permitted.
	allowedDevOrigins: ['192.168.1.9', '192.168.1.10', '10.2.13.36'],

	// Day 58 — gzip/brotli compression for API + page responses.
	// (Next.js defaults this to true; set explicitly so it's not silently
	// disabled by a future config merge.)
	compress: true,

	images: {
		// Member/church avatars and logos are stored in Supabase Storage —
		// next/image refuses to optimize a remote host it doesn't know about.
		// Falls back to no remote patterns (only local /public images work)
		// when Supabase isn't configured, same convention as the API routes.
		remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
			? [
					{
						protocol: 'https',
						hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
						pathname: '/storage/v1/object/public/**',
					},
				]
			: [],
	},
};

export default nextConfig;
