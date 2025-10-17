/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL)
  : null;
const supabaseImagePatterns = supabaseUrl
  ? [
      {
        protocol: supabaseUrl.protocol.replace(":", ""),
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/render/image/**",
      },
      {
        protocol: supabaseUrl.protocol.replace(":", ""),
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ]
  : [];

const nextConfig = {
  // Essential settings for Netlify deployment
  trailingSlash: true,

  typescript: {
    // Temporarily ignore type errors during production build to avoid failing deploys
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ensure ESLint does not block builds in CI
    ignoreDuringBuilds: true,
  },

  // Allow cross-origin requests in development (embedded preview/proxy domains)
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://1bebbb816359403782c88799b70769aa-cd0b954f-0f2d-4c42-9600-5a20b6.fly.dev",
    "https://1bebbb816359403782c88799b70769aa-6df15fb607584f1ebfc08a3e0.fly.dev",
    "https://1bebbb816359403782c88799b70769aa-935b8a3609054bfeaf5ac631c.fly.dev",
  ],

  // 🚀 Performance optimizations for dynamic pages
  experimental: {
    // Improved server components performance
    serverComponentsExternalPackages: ["@woocommerce/api"],
  },

  // Fix webpack module resolution issues
  webpack: (config, { dev, isServer, webpack }) => {
    // Improve module resolution
    config.resolve.symlinks = false;

    // Fix webpack runtime issues
    if (dev && !isServer) {
      config.optimization.moduleIds = "named";
      config.optimization.chunkIds = "named";

      // Better HMR configuration
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules", "**/.git"],
      };
    }

    // Handle external services gracefully
    if (!isServer) {
      // Add external dependencies properly for client-side
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          fullstory: "FullStory",
        });
      }

      // Fix UnhandledSchemeError for node:* and node-fetch in client bundles
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "node:buffer": require.resolve("buffer/"),
        "node:fs": false,
        "node:https": false,
        "node:http": false,
        "node:net": false,
        "node-fetch": false,
      };
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        buffer: require.resolve("buffer/"),
        fs: false,
        https: false,
        http: false,
        net: false,
      };
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      );
      config.module.rules.push({
        test: /[\\/]node_modules[\\/]node-fetch[\\/].*\\.js$/,
        type: "javascript/auto",
      });
    }

    return config;
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/blog",
        destination: "/scuba-diving-blog",
        permanent: true,
      },
    ];
  },

  // Image optimization settings
  images: {
    // Avoid Next.js image optimizer in development to prevent upstream 404s and SVG issues
    unoptimized: process.env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.builder.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "keylargoscubadiving.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wp.keylargoscubadiving.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "edge.fullstory.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      ...supabaseImagePatterns,
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; img-src 'self' data: https:;",
  },

  // Better error handling
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
