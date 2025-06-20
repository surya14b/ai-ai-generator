# 🎬 AI Video Ad Generator

Transform any product URL into compelling video advertisements using AI — built in under 24 hours!

---

## 🚀 Features

* **URL to Video Pipeline**: Convert product pages into professional video ads
* **Smart Web Scraping**: Automatically extracts product images, descriptions, and features
* **AI-Powered Script Generation**: Creates compelling ad copy using local AI models
* **Automated Video Creation**: Generates 15–30 second videos with animations and text overlays
* **Multi-Platform Support**: Works with Shopify, Amazon, and more
* **Real-Time Processing**: Live progress updates during video generation
* **Video Management**: Dashboard to view, download, and manage generated videos

---

## 🛠 Tech Stack

### Frontend

* React 18 + Vite
* Tailwind CSS
* Axios

### Backend

* Node.js + Express
* Puppeteer (Web Scraping)
* LM Studio (Local AI)
* FFmpeg (Video Processing)

### AI & Video Generation

* LM Studio with local LLMs
* Programmatic animations and overlays
* FFmpeg-based video composition
* Multiple aspect ratio support

---

## 📋 Prerequisites

* **Node.js** v16+
* **FFmpeg** (for video generation)
* **LM Studio** (for local AI model hosting)

### Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg
```

### Install LM Studio

1. Download: [https://lmstudio.ai/](https://lmstudio.ai/)
2. Load a model (e.g., Llama 3.1 8B Instruct)
3. Start the server at: `http://localhost:1234`

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-video-generator.git
cd ai-video-generator
```

### 2. Setup LM Studio

* Download LM Studio and a suitable model
* Start the local server from LM Studio GUI
* Confirm: `http://localhost:1234` is running

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=local-model
```

Start server:

```bash
npm run dev
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 5. Access the App

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:3001](http://localhost:3001)
* Health Check: `/api/health`

---

## 📖 Usage Guide

### 1. Paste a Product URL

* Supports Shopify, Amazon, general e-commerce

### 2. Automated Processing

* Scraping ➝ AI Script ➝ Video Generation

### 3. Preview & Download

* Preview ad video
* Download MP4
* Regenerate for variations

### ✅ Sample URLs

```
https://shop.gymshark.com/products/vital-seamless-leggings-black
https://www.allbirds.com/products/mens-tree-runners
https://bluebottlecoffee.com/store/hayes-valley-espresso
```

---

## 🏗 Architecture

```text
Frontend (React + Tailwind)
    ↓
Backend API (Node.js + Express)
    ↓
┌─────────────┬──────────────┬──────────────┐
│  Scraper    │  AI Engine   │ Video Maker  │
│ (Puppeteer) │ (LM Studio)  │  (FFmpeg)    │
└─────────────┴──────────────┴──────────────┘
    ↓             ↓              ↓
Product Info ➝ Ad Script ➝ Final MP4
```

---

## 🔧 Customization

### 🎞 Video Templates

Edit `backend/src/services/videoGenerator.js`

```js
getTextPosition(sceneType) {
  switch (sceneType) {
    case 'hook': return 'x=(w-text_w)/2:y=h*0.8';
    case 'cta': return 'x=(w-text_w)/2:y=h*0.1';
  }
}

getFontSize(sceneType) {
  switch (sceneType) {
    case 'hook': return 72;
    case 'cta': return 64;
  }
}
```

### 🧠 AI Prompts

Edit `backend/src/services/aiGenerator.js`

```js
createScriptPrompt(productData) {
  return `Create a compelling ${this.duration}-second video ad for:
  Product: ${productData.title}
  Style: ${this.style}
  Target: ${this.audience}`;
}
```

---

## 🐛 Troubleshooting

### LM Studio Not Connecting

```bash
curl http://localhost:1234/health
```

* Ensure model is loaded
* Port 1234 is not blocked

### FFmpeg Missing

```bash
ffmpeg -version
```

* Install it as per OS instructions

### Scraping Fails

* Some sites block automated bots
* Try different URLs

### Video Generation is Slow

* Typical time: 1–3 minutes
* Ensure enough CPU/RAM is available

---

## 📊 Performance

| Stage           | Time           |
| --------------- | -------------- |
| Web Scraping    | 5–15 sec       |
| AI Script       | 3–8 sec        |
| Video Rendering | 30–120 sec     |
| **Total**       | **\~1–3 mins** |

---

## 🚀 Deployment

### Local Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 🔐 Security

* Do not commit API keys
* Validate all user input
* Use HTTPS in production
* Add rate limiting and authentication

---

## 📈 Future Enhancements

### Features

* Multiple video templates
* Background music
* Voice-over generation
* Batch processing
* Custom branding
* A/B script testing

### Technical

* Queue system for processing
* Caching for repeated URLs
* Real-time collaboration
* Compression optimization

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Commit and push

```bash
git commit -m "Add new feature"
git push origin feature/my-feature
```

4. Open a pull request

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 🙏 Acknowledgments

* OpenAI & LM Studio
* FFmpeg
* React & Node.js community
* Tailwind CSS

---

## 📞 Support

* Check Troubleshooting section
* Browse [Issues](https://github.com/your-username/ai-video-generator/issues)
* Open a new issue for bugs or feature requests

---


