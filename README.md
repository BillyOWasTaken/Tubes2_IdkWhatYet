<h1> Tugas Besar 2 - DOM Tree </h1>

<h2> Deskripsi </h2>
Membuat aplikasi traversal pohon HTML (DOM Tree) yang menggunakan algoritma Breadth First Search (BFS) dan Depth First Search (DFS) untuk melakukan pencarian elemen berdasarkan CSS selector pada struktur DOM.

<h2> SRS Sementara </h2>
<ul> 
    <li> Aplikasi mesti melakukan scrapping dari URL.
    Input: URL website/ masukin test, pemilihan BFS/DFS, CSS selector； Output: top n kemunculan</li>
    <li>HTML yang diperoleh diparsing menjadi struktur data pohon.</li>
    <li>[OUTPUT] Aplikasi dapat menampilkan visualisasi struktur DOM dengan maksimum kedalaman tree.</li>
    <li>[OUTPUT] Menampilkan highlight pada jalur yang ditraversal, menandakan elemen yang terpengaruh.</li>
    <li>[OUTPUT] Waktu pencarian.</li>
    <li>[OUTPUT] Traversal log yang memiliki info tahapan penelusuran.</li>
</ul>


<h2>Beberapa penjelasan struktur folder di Backend.</h2>
<ul>
    <li> Core : entity </li>
    <li> Data : logic </li>
    <li> Presentation : handle API (input/output) </li>
</ul>