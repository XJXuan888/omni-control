
# omni-control

**Web Interface for Control of Omnibot**

----------

## 📁 Repository Structure

```
omni-control/
├── Backend/           # Server‑side code (Node.js, Express, etc.)
├── Frontend/          # Client‑side app (React, Vue, etc.)
├── dist/              # Compiled output (backend + frontend)
├── var/               # Runtime variables or data storage
├── .gitignore         # Files/folders excluded from Git
└── package.json       # Root scripts & dependency definitions

```

----------

## ⚙️ Prerequisites

-   **Node.js** v16.x or higher
    
-   **npm** v8.x or higher (or yarn)
    

----------

## 🚀 Getting Started

1.  **Clone the repository**
    

git clone [https://github.com/XJXuan888/omni-control.git](https://github.com/XJXuan888/omni-control.git)  
cd omni-control

2.  **Install root‑level dependencies**
```bash
npm install
```

3.  **Build the Backend**
```bash    
cd Backend  
npm install  
npm run build
```
> Compiles server code into `Backend/dist/`

4. **Build the Frontend**
```bash
cd ../Frontend
npm install
npm run build
```

> Generates production assets in `Frontend/dist/`

6. **Start the application**
```bash
node dist/server.js
```

-   **Backend API**: `http://localhost:3000`
    
-   **Frontend UI**: `http://localhost:8080`


## 📜 License

This project is released under the **MIT License**.


```
