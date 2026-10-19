# Analitik Pebble

Pebble menampilkan metrik yang mengikuti periode dan sumber datanya:

- Keuangan: ringkasan dapat difilter harian, mingguan, bulanan, atau tahunan (default bulan berjalan); pada tampilan bulanan, ringkasan, pie kategori, transaksi, dan budget mengikuti bulan yang dipilih. Riwayat budget mendukung salin budget bulan sebelumnya; rollover manual mengumpulkan sisa positif dari kategori lain ke kategori Tabungan untuk bulan berikutnya, tanpa membawa overspending. Grafik transaksi membandingkan enam bulan terakhir.
- Queue: ringkasan memisahkan tugas terlambat, jatuh tempo hari ini, dan penyelesaian tujuh hari terakhir.
- Goal: progress angka dicatat setiap kali nilainya berubah; grafik memperlihatkan persentase terhadap target.
- Dashboard: menyatukan pengeluaran bulanan, progress goal terukur, kondisi tugas, arus kas, dan penyelesaian tugas.

## Riwayat dan migrasi

`TaskCompletionEvent` menyimpan setiap perubahan tugas menuju status selesai, termasuk jika tugas yang sama diselesaikan kembali setelah dibuka. `GoalProgressLog` menyimpan nilai awal goal angka baru dan setiap perubahan berikutnya.

Rekonsiliasi keuangan menyimpan tanggal dan saldo laporan, serta mengunci transaksi yang dicocokkan. Budget lama mendapat nilai rollover awal `0`; transaksi lama tidak otomatis dianggap telah direkonsiliasi. Riwayat analitik tugas dan goal dimulai setelah migrasi diterapkan. Nilai lama yang tidak memiliki catatan tidak direkonstruksi, sehingga penyelesaian tugas dan perubahan goal sebelum migrasi tidak muncul di grafik historis. Migrasi bersifat aditif; jalankan dengan prosedur deployment di [DEPLOY.md](./DEPLOY.md). Jangan mengganti migrasi aplikasi dengan reset database.

## Referensi pola

Referensi publik yang ditinjau untuk pola produk—bukan untuk menyalin kode, aset, atau branding:

- [Actual Budget](https://github.com/actualbudget/actual): pemantauan arus kas dan budget per kategori.
- [Iotawise](https://github.com/redpangilinan/iotawise): konsistensi habit dan ringkasan aktivitas.
- [Task Organizer](https://github.com/sanliuk/task-organizer): analitik penyelesaian tugas berbasis waktu.
- [Synapse](https://github.com/vincenzo-afk/Synapse): ringkasan lintas modul produktivitas dan keuangan.

Pola tersebut disesuaikan dengan model data, navigasi, dan gaya visual Pebble; tidak ada kode atau aset dari repository tersebut yang disalin.
