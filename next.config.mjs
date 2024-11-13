/** @type {import('next').NextConfig} */
module.exports = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('@sparticuz/chromium')
        }
        return config
    },
}
export default nextConfig;
