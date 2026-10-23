# Panduan Deploy ke VPS

Stack: **Next.js 16** · **PostgreSQL 16** · **Nginx** · **Docker Compose** · **Let's Encrypt SSL**

---

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Persiapan Domain & DNS](#2-persiapan-domain--dns)
3. [Siapkan Kredensial Eksternal](#3-siapkan-kredensial-eksternal)
4. [Setup VPS](#4-setup-vps)
5. [Upload & Konfigurasi Aplikasi](#5-upload--konfigurasi-aplikasi)
6. [Pasang SSL dengan Certbot](#6-pasang-ssl-dengan-certbot)
7. [Update Konfigurasi Nginx untuk HTTPS](#7-update-konfigurasi-nginx-untuk-https)
8. [Jalankan Aplikasi](#8-jalankan-aplikasi)
9. [Verifikasi](#9-verifikasi)
10. [Perintah Maintenance](#10-perintah-maintenance)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prasyarat

### Spesifikasi VPS Minimum

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| CPU      | 1 vCPU  | 2 vCPU      |
| RAM      | 1 GB    | 2 GB        |
| Storage  | 20 GB SSD | 40 GB SSD |
| OS       | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

> RAM 1 GB hanya ditujukan untuk pemakaian ringan dan tetap ketat karena aplikasi, PostgreSQL, Nginx, serta sistem operasi berbagi memori. Build dijalankan oleh GitHub Actions, bukan di VPS. Jika penggunaan meningkat atau terjadi proses dihentikan karena kehabisan memori, naikkan VPS ke 2 GB.

> Provider VPS yang umum: DigitalOcean, Vultr, Hetzner, Linode, atau IDCloudHost.

### Yang Kamu Butuhkan

- Akses SSH ke VPS (username + password atau SSH key)
- Nama domain yang sudah dibeli (contoh: `aplikasiku.com`)
- Akun Google Cloud Console untuk OAuth
- Repository GitHub dan GitHub Actions aktif untuk membangun image Docker

---

## 2. Persiapan Domain & DNS

### Arahkan Domain ke IP VPS

Masuk ke panel DNS provider domain kamu, tambahkan record berikut:

| Type | Name | Value          | TTL  |
|------|------|----------------|------|
| A    | `@`  | `<IP_VPS_KAMU>` | 3600 |
| A    | `www` | `<IP_VPS_KAMU>` | 3600 |

Contoh jika domain kamu `pebble.com` dan IP VPS `123.45.67.89`:

```
A    @    123.45.67.89   3600
A    www  123.45.67.89   3600
```

> DNS propagasi membutuhkan waktu 10–60 menit. Cek dengan: `nslookup pebble.com`

---

## 3. Siapkan Kredensial Eksternal

### 3.1 Google OAuth (untuk login)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih yang sudah ada
3. Navigasi ke **APIs & Services → OAuth consent screen**
   - User Type: **External**
   - Isi nama aplikasi, email support
   - Tambahkan scope: `email`, `profile`, `openid`
4. Navigasi ke **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins:**
     ```
     https://yourdomain.com
     ```
   - **Authorized redirect URIs:**
     ```
     https://yourdomain.com/api/auth/callback/google
     ```
5. Salin **Client ID** dan **Client Secret** — akan dipakai di `.env`

### 3.2 VAPID Keys (untuk Web Push Notification)

Jalankan perintah ini di laptop/komputer lokal kamu (butuh Node.js):

```bash
npx web-push generate-vapid-keys
```

Output:
```
Public Key:
BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA

Private Key:
yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

Simpan kedua key ini.

### 3.3 NEXTAUTH_SECRET

Generate secret yang kuat dengan perintah:

```bash
# Di Linux/Mac
openssl rand -base64 32

# Di Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# Atau pakai Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 4. Setup VPS

### 4.1 Login ke VPS

```bash
ssh root@<IP_VPS_KAMU>
# atau jika pakai user lain:
ssh ubuntu@<IP_VPS_KAMU>
```

### 4.2 Update Sistem

```bash
apt update && apt upgrade -y
```

### 4.3 Install Docker

```bash
# Install dependensi
apt install -y ca-certificates curl gnupg lsb-release

# Tambah GPG key Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Tambah repo Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verifikasi instalasi
docker --version
docker compose version
```

### 4.4 Install Git & Certbot

```bash
apt install -y git certbot
```

### 4.5 Konfigurasi Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 5. Upload & Konfigurasi Aplikasi

### 5.1 Clone atau Upload Kode

**Opsi A — Via Git (direkomendasikan):**

```bash
cd /opt
git clone https://github.com/username/repo-kamu.git pebble
cd pebble
```

**Opsi B — Via SCP dari komputer lokal:**

```bash
# Jalankan di komputer lokal kamu
scp -r /path/ke/folder/aplikasi root@<IP_VPS>:/opt/pebble
```

### 5.2 Buat File `.env`

```bash
cd /opt/pebble
nano .env
```

Isi file `.env` dengan nilai yang sudah kamu siapkan di Langkah 3:

```env
# ── Aplikasi ────────────────────────────────────────────────
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<hasil_openssl_rand_dari_langkah_3.3>

# Password PostgreSQL baru; gunakan karakter hex agar aman di DATABASE_URL
POSTGRES_PASSWORD=<hasil_openssl_rand_-hex_24>

# ── Google OAuth ────────────────────────────────────────────
GOOGLE_CLIENT_ID=<client_id_dari_google_console>
GOOGLE_CLIENT_SECRET=<client_secret_dari_google_console>

# ── Web Push (VAPID) ────────────────────────────────────────
VAPID_PUBLIC_KEY=<public_key_dari_langkah_3.2>
# Harus sama dengan VAPID_PUBLIC_KEY; disematkan ke bundle browser saat image dibangun
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key_dari_langkah_3.2>
VAPID_PRIVATE_KEY=<private_key_dari_langkah_3.2>
VAPID_EMAIL=mailto:admin@yourdomain.com

# Secret acak untuk pemanggilan pengingat terjadwal (minimal 32 byte acak)
CRON_SECRET=<secret_acak_untuk_cron>

# DATABASE_URL dan nama image Docker diatur di docker-compose.yml
```

> **Penting:** Ganti `yourdomain.com` di semua baris dengan domain kamu yang sebenarnya.
> Buat password baru dengan `openssl rand -hex 24`. Jika menggunakan database volume lama yang sebelumnya memakai password `pebble`, pertahankan nilai `POSTGRES_PASSWORD=pebble` agar aplikasi tetap dapat tersambung; ubah password database lama secara terencana sebelum menggantinya.

### 5.3 Siapkan build image otomatis

Workflow `.github/workflows/publish-images.yml` membangun image aplikasi dan migrasi di GitHub Actions saat ada push ke branch `main` atau `master`. VPS hanya mengunduh image hasil build, sehingga tidak menjalankan proses build yang berat.

1. Di GitHub, buka **Settings → Secrets and variables → Actions → Variables**, lalu tambahkan variable `VAPID_PUBLIC_KEY` dengan nilai VAPID public key aplikasi.
2. Push perubahan ke `main` atau `master`, lalu pastikan workflow **Build and publish Docker images** berhasil di tab **Actions**.
3. Pastikan package GitHub Container Registry (`ghcr.io/priya190104/pebbleaps`) dapat di-pull oleh VPS. Untuk package private, login di VPS memakai Personal Access Token yang memiliki akses `read:packages`:

   ```bash
   read -s GHCR_READ_TOKEN
   printf '%s' "$GHCR_READ_TOKEN" | docker login ghcr.io -u <USERNAME_GITHUB> --password-stdin
   unset GHCR_READ_TOKEN
   ```

> Ganti nama image pada `docker-compose.yml` jika repository GitHub ini dipindah atau menggunakan nama package GHCR yang berbeda.

### 5.4 Buat Folder Sertifikat Nginx

```bash
mkdir -p /opt/pebble/nginx/certs
```

---

## 6. Pasang SSL dengan Certbot

SSL harus dipasang **sebelum** mengaktifkan konfigurasi HTTPS di Nginx. Certbot akan menjalankan web server sementara di port 80.

```bash
# Pastikan belum ada service yang memakai port 80
certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos \
  --non-interactive
```

Setelah berhasil, sertifikat ada di:
```
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Salin Sertifikat ke Folder Nginx

```bash
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/pebble/nginx/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/pebble/nginx/certs/

# Set permission agar bisa dibaca container
chmod 644 /opt/pebble/nginx/certs/fullchain.pem
chmod 600 /opt/pebble/nginx/certs/privkey.pem
```

### Auto-Renew Sertifikat

Certbot secara otomatis mendaftarkan cron job, tapi kita perlu hook untuk menyalin ulang sertifikat setelah renewal:

```bash
nano /etc/letsencrypt/renewal-hooks/deploy/copy-certs.sh
```

Isi file tersebut:

```bash
#!/bin/bash
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/pebble/nginx/certs/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/pebble/nginx/certs/
chmod 644 /opt/pebble/nginx/certs/fullchain.pem
chmod 600 /opt/pebble/nginx/certs/privkey.pem
docker compose -f /opt/pebble/docker-compose.yml restart nginx
```

```bash
chmod +x /etc/letsencrypt/renewal-hooks/deploy/copy-certs.sh
```

---

## 7. Update Konfigurasi Nginx untuk HTTPS

Edit file `nginx/nginx.conf` agar mengaktifkan HTTPS dan redirect HTTP → HTTPS:

```bash
nano /opt/pebble/nginx/nginx.conf
```

Ganti seluruh isinya dengan konfigurasi berikut (ganti `yourdomain.com`):

```nginx
upstream pebble_app {
  server app:3000;
}

# Redirect semua HTTP ke HTTPS
server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;
  return 301 https://$host$request_uri;
}

# HTTPS
server {
  listen 443 ssl;
  server_name yourdomain.com www.yourdomain.com;

  ssl_certificate     /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;
  ssl_ciphers         HIGH:!aNULL:!MD5;
  ssl_session_cache   shared:SSL:10m;
  ssl_session_timeout 10m;

  # Ukuran maksimal upload
  client_max_body_size 10M;

  location / {
    proxy_pass         http://pebble_app;
    proxy_http_version 1.1;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
  }
}
```

---

## 8. Jalankan Aplikasi

```bash
cd /opt/pebble

# Unduh image yang sudah dibangun GitHub Actions, lalu jalankan layanan
docker compose pull
docker compose up -d

# Cek status semua container
docker compose ps
```

Output yang diharapkan:
```
NAME            IMAGE           STATUS          PORTS
pebble-app-1      ghcr.io/...:app       Up
pebble-migrate-1  ghcr.io/...:migrate   Exited (0)
pebble-db-1       postgres:16-alpine    Up (healthy)
pebble-nginx-1    nginx:alpine          Up
```

Service `migrate` yang berstatus `Exited (0)` menandakan migrasi berhasil. Aplikasi menunggu migrasi selesai sebelum mulai menerima trafik.

### (Opsional) Seed Data Awal

Jika kamu ingin mengisi database dengan data contoh:

```bash
docker compose run --rm migrate ./node_modules/.bin/prisma db seed
```

### Jadwalkan Pengingat Deadline

Pengguna mengaktifkan notifikasi pada **Pengaturan → Pengingat Deadline** di setiap perangkat. Agar pengingat sehari sebelum deadline terkirim otomatis, atur cron di host VPS. Endpoint hanya menerima secret `CRON_SECRET`; jangan simpan secret ini di kode atau jalankan cron dari browser.

Contoh cron setiap hari pukul 00:05 UTC:

```cron
5 0 * * * curl --fail --silent --show-error -X POST https://yourdomain.com/api/push/send -H "Authorization: Bearer <CRON_SECRET>"
```

Ganti domain dan placeholder dengan nilai dari `.env`. Perintah mengirim reminder untuk tugas yang jatuh tempo esok hari UTC. Pastikan `CRON_SECRET` telah diset sebelum memasang jadwal.

---

## 9. Verifikasi

### Cek kode sebelum deploy

Jalankan dari root proyek di komputer pengembang:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

### Cek Aplikasi Berjalan

```bash
# Akses via HTTP (harus redirect ke HTTPS)
curl -I http://yourdomain.com

# Cek HTTPS berjalan
curl -I https://yourdomain.com
```

### Cek Log Aplikasi

```bash
# Log semua service secara real-time
docker compose logs -f

# Log hanya app
docker compose logs -f app

# Log hanya nginx
docker compose logs -f nginx
```

### Cek SSL

Buka browser dan kunjungi `https://yourdomain.com` — pastikan ada ikon gembok di address bar. Atau cek via: [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

## 10. Perintah Maintenance

### Restart Service

```bash
# Restart semua
docker compose restart

# Restart service tertentu
docker compose restart app
docker compose restart nginx
```

### Update Aplikasi (Deploy Ulang)

```bash
cd /opt/pebble

# Ambil konfigurasi deploy terbaru
git pull

# Ambil image terbaru dari GitHub Actions dan deploy tanpa build di VPS
docker compose pull
docker compose up -d
```

### Backup Database

```bash
# Dump database ke file SQL
docker compose exec db pg_dump -U pebble pebble > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore dari backup
docker compose exec -T db psql -U pebble pebble < backup_20260812_120000.sql
```

### Lihat Penggunaan Resource

```bash
docker stats
```

### Matikan Semua Service

```bash
# Hentikan tanpa menghapus data
docker compose down

# Hentikan DAN hapus semua data (HATI-HATI: database akan terhapus)
docker compose down -v
```

### Jalankan Migrasi Database Manual

```bash
docker compose run --rm migrate
```

Migrasi analitik menambahkan riwayat penyelesaian tugas dan perubahan progress goal. Migrasi ini tidak menghapus data, tetapi riwayat hanya tercatat mulai setelah migrasi diterapkan; data lama yang tidak memiliki log tidak direkonstruksi. Detail metrik dan sumber pola desain ada di [ANALYTICS.md](./ANALYTICS.md).

### Akses Shell Database

```bash
docker compose exec db psql -U pebble pebble
```

---

## 11. Troubleshooting

### Container `app` tidak mau start

```bash
docker compose logs app
```

Penyebab umum:
- `DATABASE_URL` salah → cek `.env`
- Migrasi gagal → cek `docker compose logs migrate`
- Port 3000 konflik → jarang terjadi dalam Docker network

### Error `NEXTAUTH_URL` mismatch

Pastikan nilai `NEXTAUTH_URL` di `.env` **persis sama** dengan URL yang dipakai di browser, termasuk `https://` dan tanpa trailing slash.

### Halaman "Welcome to nginx!" muncul

Konfigurasi di `nginx/nginx.conf` meneruskan request ke service `app`. Jika halaman bawaan Nginx muncul, periksa apakah Compose dijalankan dari folder deployment yang benar dan apakah konfigurasi tersebut benar-benar ter-mount:

```bash
cd /opt/pebble
test -f nginx/nginx.conf
docker compose ps
docker compose exec nginx sh -c 'grep -nE "upstream pebble_app|proxy_pass http://pebble_app" /etc/nginx/conf.d/default.conf'
```

Perintah terakhir seharusnya menampilkan `upstream pebble_app` dan `proxy_pass http://pebble_app`. Jika berkas tidak ada atau hasilnya berbeda, pastikan folder `nginx/` dari repository tersedia di `/opt/pebble`, lalu buat ulang container Nginx:

```bash
docker compose up -d --force-recreate nginx
docker compose exec nginx nginx -t
```

Jika Compose dijalankan dengan file konfigurasi dari lokasi lain, gunakan `-f /opt/pebble/docker-compose.yml --project-directory /opt/pebble` pada perintah di atas agar bind mount memakai folder deployment yang benar. Bila konfigurasi container sudah cocok tetapi halaman bawaan tetap muncul, periksa apakah port 80 pada host diarahkan ke container atau service Nginx lain.

### SSL tidak muncul / sertifikat expired

```bash
# Cek sisa masa berlaku sertifikat
certbot certificates

# Renew manual (jika belum direnew otomatis)
certbot renew
```

### Error 502 Bad Gateway dari Nginx

Container `app` belum siap saat Nginx sudah jalan. Tunggu beberapa detik lalu:

```bash
docker compose restart nginx
```

### Push Notification tidak berfungsi

- Pastikan `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY` di `.env` sesuai pasangannya (generate ulang jika tidak yakin)
- Pastikan variable GitHub Actions `VAPID_PUBLIC_KEY` sama dengan `VAPID_PUBLIC_KEY` di `.env`. Setelah mengubahnya, jalankan workflow build image lagi lalu `docker compose pull` dan `docker compose up -d`.
- Akses harus via HTTPS — push notification **tidak bisa** berjalan di HTTP

### Login Google gagal / redirect error

1. Cek **Authorized redirect URIs** di Google Console sudah berisi `https://yourdomain.com/api/auth/callback/google`
2. Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` di `.env` sudah benar
3. Cek log: `docker compose logs app | grep -i auth`

---

## Ringkasan Alur Deploy

```
GitHub Actions
 ├── Build image app (Next.js standalone)
 ├── Build image migrasi (Prisma CLI)
 └── Push keduanya ke GitHub Container Registry

VPS 1 GB
 ├── Install Docker, Git, Certbot
 ├── Clone repo → /opt/pebble; isi .env
 ├── Ambil SSL cert dan aktifkan konfigurasi HTTPS
 └── docker compose pull && docker compose up -d
         ├── Container: db (PostgreSQL)
         ├── Container: migrate (jalankan migrasi lalu berhenti)
         ├── Container: app (Next.js standalone)
         └── Container: nginx (reverse proxy + SSL termination)
```

---

## Referensi

- [Docker Documentation](https://docs.docker.com/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [NextAuth.js v5 Docs](https://authjs.dev/)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [web-push VAPID](https://www.npmjs.com/package/web-push)
