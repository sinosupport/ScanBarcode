module.exports = {
  apps: [
    {
      name: 'scanbarcode-preview',
      cwd: __dirname,
      script: './node_modules/vite/bin/vite.js',
      // Serve build via Vite preview on port 1423 with HTTPS (required for camera)
      // Replace cert/key paths with your actual certificate files.
      args: [
        'preview', '--host', '--port', '1423',
        '--https',
        '--cert', 'D:\\certs\\cloud.sino.co.th.crt',
        '--key', 'D:\\certs\\cloud.sino.co.th.key'
      ],
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
}
