# Web3 Voting System (Pemilu Digital)

Sistem voting digital berbasis blockchain yang menggunakan teknologi pengenalan wajah untuk memastikan integritas dan keamanan pemilihan.

## 🌟 Fitur Utama

- **Blockchain Voting**: Menggunakan smart contract Ethereum untuk transparansi dan immutability
- **Face Recognition**: Sistem pengenalan wajah untuk mencegah vote ganda
- **Admin Panel**: Interface untuk mengelola proposal/kandidat
- **Real-time Results**: Hasil voting yang dapat dilihat secara real-time
- **Decentralized**: Fully decentralized voting system

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Face-API.js** - Face recognition library
- **Ethers.js** - Ethereum library

### Backend/Blockchain
- **Smart Contract** - Deployed on Ethereum network
- **Node.js** - Server runtime for API routes

## 🏗️ Struktur Proyek

```
web3-pemilu/
├── src/
│   ├── app/
│   │   ├── api/             # Next.js API routes
│   │   │   ├── proposals/   # Proposal management
│   │   │   ├── vote/        # Voting logic
│   │   │   └── initialize/  # System initialization
│   │   ├── voting.tsx       # Client side component
│   │   └── page.tsx         # Server side component
│   └── lib/
│       ├── voting-system.ts # Core voting logic
│       └── utils.ts         # Utility functions
├── public/
│   └── models/              # Face-API.js models
├── next.config.js           # Next.js configuration
└── package.json
```
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau bun
- Git

### 1. Clone Repository

```bash
git clone https://github.com/dipaadipati/web3-pemilu.git
cd web3-pemilu
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env`:

```env
# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here

# Show admin panel
NEXT_PUBLIC_ADMIN_PANEL=true
```

### 4. Setup Smart Contract

Pastikan Anda sudah memiliki smart contract yang ter-deploy. Jika belum:
1. Clone repo backend terpisah yang menggunakan Hardhat
2. Deploy smart contract ke network yang diinginkan
3. Copy contract address ke environment variables


### 5. Download Face-API Models

Download [model files](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) dan letakkan di `public/models/`:
- `ssd_mobilenetv1_model-weights_manifest.json`
- `ssd_mobilenetv1_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📖 Cara Penggunaan

### Setup Awal
1. Pastikan smart contract sudah ter-deploy di network yang diinginkan
2. Set environment variables dengan contract address yang benar
3. Download dan setup face-API models (jika belum ada)

### Untuk Admin

1. Pastikan menggunakan PRIVATE_KEY yang didapatkan pada `hardhat node` di daftar pertama.
2. Aktifkan `NEXT_PUBLIC_ADMIN_PANEL=true` pada `.env`
3. Tambahkan proposal(Judul Voting) baru

### Untuk Pemilih

1. Buka halaman voting di beranda
2. Pilih jawaban yang diinginkan
3. Ambil foto wajah untuk verifikasi
4. Konfirmasi vote

## 🔧 API Endpoints

### Proposals
- `GET /api/proposals` - Ambil semua proposal
- `POST /api/proposals` - Tambah proposal baru (admin only)

### Voting
- `POST /api/vote` - Submit vote dengan face verification

### System
- `POST /api/initialize` - Initialize voting system

## 🏃‍♂️ Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```
## 🔒 Keamanan

- **Face Recognition**: Setiap wajah hanya bisa vote sekali (BUG)
- **Blockchain**: Vote tersimpan immutable di blockchain
- **Private Key**: Admin key untuk contract management
- **Hash Verification**: Face descriptor di-hash untuk privacy

## 🐛 Troubleshooting

### Common Issues

1. **Module 'encoding' not found**
   ```bash
   npm install encoding
   ```

2. **Face models not loading**
   - Pastikan folder `public/models/` berisi semua model files
   - Check browser console untuk error loading

3. **Contract connection failed**
   - Pastikan smart contract sudah ter-deploy
   - Verify contract address di environment variables
   - Check private key format
   - Pastikan RPC URL dapat diakses

4. **Face detection failed**
   - Pastikan lighting yang cukup
   - Wajah harus terlihat jelas
   - Gunakan webcam dengan resolusi yang baik

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Push code ke GitHub
2. Connect repository di platform hosting
3. Set environment variables:
   - `RPC_URL`
   - `PRIVATE_KEY` 
   - `CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_ADMIN_PANEL`
4. Deploy

## 🔗 Related Repositories

- **Smart Contract**: [web3-pemilu-backend](https://github.com/dipaadipati/web3-pemilu-backend)

## 📋 Prerequisites

- Smart contract ter-deploy di Ethereum network
- Face-API models di folder public/models/
- Node.js 18+
- Environment variables configured

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: M. Adipati Rezkya
- **Repository**: Frontend (Next.js + TypeScript)
- **Related**: Smart Contract Backend (Hardhat + Solidity)

## 📞 Support

Jika ada pertanyaan atau issue:
- Create GitHub Issue
- Email: adptrzky@gmail.com
- GitHub: [@dipaadipati](https://github.com/dipaadipati)

---

**⚠️ Disclaimer**: Ini adalah project educational/demo. Untuk penggunaan production, pastikan audit security yang comprehensive.