# Analitik Pebble

Pebble menampilkan metrik yang mengikuti periode dan sumber datanya:

- Keuangan: ringkasan dapat difilter harian, mingguan, bulanan, atau tahunan (default bulan berjalan); pada tampilan bulanan, ringkasan, pie kategori, transaksi, dan budget mengikuti bulan yang dipilih. Riwayat budget mendukung salin budget bulan sebelumnya; rollover manual mengumpulkan sisa positif dari kategori lain ke kategori Tabungan untuk bulan berikutnya, tanpa membawa overspending. Grafik transaksi membandingkan enam bulan terakhir.
- Transfer kantong disimpan terpisah dari pemasukan dan pengeluaran, sehingga hanya memindahkan saldo dan tidak memengaruhi anggaran atau grafik arus kas.
- Queue: ringkasan memisahkan tugas terlambat, jatuh tempo hari ini, dan penyelesaian tujuh hari terakhir.
- Goal: progress angka dicatat setiap kali nilainya berubah; grafik memperlihatkan persentase terhadap target.
- Dashboard: menyatukan pengeluaran bulanan, progress goal terukur, kondisi tugas, arus kas, dan penyelesaian tugas.
- Dashboard admin: membandingkan login berhasil dengan pengguna aktif, DAU/WAU/MAU, pengguna yang kembali, pertumbuhan akun, dan penggunaan fitur secara agregat.

## Riwayat dan migrasi

`TaskCompletionEvent` menyimpan setiap perubahan tugas menuju status selesai, termasuk jika tugas yang sama diselesaikan kembali setelah dibuka. `GoalProgressLog` menyimpan nilai awal goal angka baru dan setiap perubahan berikutnya.

Analitik penggunaan mulai tercatat setelah migrasi dan tidak direkonstruksi dari data historis. Login berhasil disimpan per kejadian; aktivitas aplikasi dibatasi satu catatan per pengguna, area, dan hari. Dashboard admin hanya menampilkan agregat dan dibatasi ke alamat pada `ADMIN_EMAILS`. Transfer baru tidak dimasukkan ke metrik pemasukan/pengeluaran. Budget lama mendapat nilai rollover awal `0`. Migrasi menghapus metadata rekonsiliasi yang sudah tidak digunakan, tetapi tetap mempertahankan transaksi keuangan. Riwayat analitik tugas dan goal juga tidak merekonstruksi nilai sebelum migrasi. Jalankan migrasi dengan prosedur deployment di [DEPLOY.md](./DEPLOY.md). Jangan mengganti migrasi aplikasi dengan reset database.

## Referensi pola

Referensi publik yang ditinjau untuk pola produk—bukan untuk menyalin kode, aset, atau branding:

- [Actual Budget](https://github.com/actualbudget/actual): pemantauan arus kas dan budget per kategori.
- [Iotawise](https://github.com/redpangilinan/iotawise): konsistensi habit dan ringkasan aktivitas.
- [Task Organizer](https://github.com/sanliuk/task-organizer): analitik penyelesaian tugas berbasis waktu.
- [Synapse](https://github.com/vincenzo-afk/Synapse): ringkasan lintas modul produktivitas dan keuangan.

Pola tersebut disesuaikan dengan model data, navigasi, dan gaya visual Pebble; tidak ada kode atau aset dari repository tersebut yang disalin.
