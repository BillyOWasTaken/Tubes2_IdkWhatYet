# DOM Traversal Visualizer

## Overview
Aplikasi ini adalah DOM Traversal Visualizer yang memungkinkan pengguna untuk memberikan HTML atau URL, membangun pohon DOM, dan memvisualisasikan algoritma penelusuran seperti BFS (Breadth-First Search) dan DFS (Depth-First Search). Aplikasi ini menyediakan antarmuka interaktif untuk menjelajahi struktur DOM dan memahami proses penelusuran.

### Algorithms
1. **Breadth-First Search (BFS):**
   - Menjelajahi semua node pada tingkat kedalaman tertentu sebelum beralih ke node pada tingkat kedalaman berikutnya. BFS menggunakan queue untuk melacak node yang akan dikunjungi selanjutnya.

2. **Depth-First Search (DFS):**
   - Menjelajahi sejauh mungkin di setiap branch sebelum melakukan backtrack. DFS menggunakan stack (atau rekursi) untuk melacak node

Kedua algoritma tersebut dianimasikan di antarmuka pengguna untuk mendemonstrasikan proses penelusurannya.

## Requirements
Untuk menjalankan aplikasi ini, pastikan telah menginstall:

- **Node.js** 
- **npm**
- **Docker** (opsional)

## Installation
1. Clone repository:
   ```bash
   git clone https://github.com/BillyOWasTaken/Tubes2_IdkWhatYet/
   cd Tubes2_IdkWhatYet
   ```

2. Install dependencies untuk backend dan frontend:
   ```bash
   # Backend
   cd src/backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

## Build and Run
### Node.js
1. Di root directory:
   ```bash
    npm run dev
   ```
   
2. Buka aplikasi di browser pada alamat `http://localhost:5173`

### Docker
1. Build dan start Docker containers:
   ```bash
   docker-compose up --build
   ```

2. Buka aplikasi di browser pada alamat `http://localhost:5173`.

## Authors

 <div align="center" id="contributor">
   <strong>
     <h3>IdkWhatYet</h3>
     <table align="center">
       <tr align="center">
         <td>NIM</td>
         <td>Nama</td>
         <td>GitHub</td>
       </tr>
       <tr align="center">
         <td>13524110</td>
         <td>Jennifer Khang</td>
         <td><a href="https://github.com/jenka-h">@jenka-h</a></td>
       </tr>
       <tr align="center">
         <td>13524121</td>
         <td>Billy Ontoseno Irawan</td>
         <td><a href="https://github.com/BillyOWasTaken">@BillyOWasTaken</a></td>
       </tr>
       <tr align="center">
         <td>13524138</td>
         <td>Ahmad Rinofaros Muchtar</td>
         <td><a href="https://github.com/SpicyCoinCracker">@SpicyCoinCracker</a></td>
       </tr>
     </table>
   </strong>
 </div>
