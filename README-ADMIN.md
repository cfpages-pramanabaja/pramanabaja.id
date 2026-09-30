# Admin Artikel PRAMANA Baja

Panel admin untuk CRUD artikel yang otomatis menghasilkan file `.html` statis.

Semua file admin (`/admin`, `/server`, `/templates`, `/data`) **ikut di-push ke GitHub** supaya tim bisa kolaborasi.

## Setup

1. Install dependency:

```bash
npm install
```

2. Buat file `.env` dari contoh:

```bash
cp .env.example .env
```

3. Ubah kredensial admin di `.env`:

```env
PORT=8000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password-tim-kalian
```

> `.env` tidak di-commit. Setiap developer buat `.env` sendiri di lokal.

## Menjalankan

```bash
npm run dev
```

Buka:

- Site: `http://localhost:8000/`
- Admin: `http://localhost:8000/admin`
- Listing artikel admin: `http://localhost:8000/artikel/managed/`

## Alur CRUD

| Aksi | Hasil |
|------|-------|
| Create | Buat `{slug}.html` + update `data/articles.json` + inject ke `/artikel/index.html` + regenerate `/artikel/managed/` |
| Update | Regenerate HTML, update entri di `/artikel/`, rename file jika slug berubah |
| Delete | Hapus file HTML admin + hilangkan dari `/artikel/` (artikel lama WordPress tidak terpengaruh) |

## Upload gambar

- Endpoint: `POST /api/upload` (multipart field: `image`)
- Disimpan ke `wp-content/uploads/YYYY/MM/`
- Otomatis dikonversi ke JPG dan dikompres maks. **500KB**
- Bisa dipakai di gambar utama editor maupun gambar di konten WYSIWYG

## Import artikel lama (opsional)

Scan file `.html` existing yang punya class `single-post` / kategori artikel:

```bash
npm run import-articles
```

Import hanya menambah metadata ke `data/articles.json` (tidak overwrite HTML existing).

## Kolaborasi GitHub

Setelah edit artikel lewat admin, commit file berikut:

- `data/articles.json`
- `{slug}.html` (file artikel)
- `artikel/index.html` (listing utama — artikel baru di-inject di paling atas)
- `artikel/managed/index.html` (listing cadangan)
- `wp-content/uploads/...` (jika ada upload gambar baru)

`.env` dan `node_modules/` tidak perlu di-commit.

## Struktur

```
admin/          UI dashboard
server/         API + static file server
templates/      Template HTML generator
data/           Metadata artikel (articles.json)
artikel/managed/ Listing artikel hasil admin
```
