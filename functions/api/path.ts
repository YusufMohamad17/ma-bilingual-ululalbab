interface Env {
  DB: D1Database;
  KV: KVNamespace;
  BUCKET: R2Bucket;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // Set standard response & CORS headers for safety
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. GET /api/pengaturan
    if (path === "/api/pengaturan" && method === "GET") {
      const { results } = await env.DB.prepare("SELECT kunci, nilai FROM pengaturan").all();
      const config: Record<string, string> = {};
      results.forEach((row: any) => {
        config[row.kunci] = row.nilai;
      });
      return new Response(JSON.stringify(config), { headers: corsHeaders });
    }

    // 2. GET /api/kegiatan
    if (path === "/api/kegiatan" && method === "GET") {
      const kategori = url.searchParams.get("kategori");
      let query = "SELECT * FROM kegiatan WHERE status = 'published'";
      let stmt;
      if (kategori && kategori !== "Semua") {
        query += " AND LOWER(kategori) = LOWER(?)";
        stmt = env.DB.prepare(query).bind(kategori);
      } else {
        stmt = env.DB.prepare(query);
      }
      const { results } = await stmt.all();
      
      // Sort in JS: terbaru paling atas
      results.sort((a: any, b: any) => new Date(b.tanggal_mulai).getTime() - new Date(a.tanggal_mulai).getTime());
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // 3. GET /api/guru
    if (path === "/api/guru" && method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM guru WHERE status = 'aktif'").all();
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // 4. GET /api/alumni
    if (path === "/api/alumni" && method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM alumni").all();
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // 5. GET /api/jadwal
    if (path === "/api/jadwal" && method === "GET") {
      const kelas = url.searchParams.get("kelas");
      let query = "SELECT * FROM jadwal WHERE is_aktif = 1";
      let stmt;
      if (kelas) {
        query += " AND LOWER(kelas) = LOWER(?)";
        stmt = env.DB.prepare(query).bind(kelas);
      } else {
        stmt = env.DB.prepare(query);
      }
      const { results } = await stmt.all();
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // 6. POST /api/ppdb/daftar
    if (path === "/api/ppdb/daftar" && method === "POST") {
      const body: any = await request.json();
      const {
        nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
        alamat, kelurahan, kecamatan, kota, provinsi,
        nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, no_hp_ortu, email_ortu,
        asal_sekolah, nilai_rata_rata, tahun_lulus, pilihan_kelas, jalur
      } = body;

      if (!nama_lengkap || !nik || !no_hp_ortu) {
        return new Response(JSON.stringify({ error: "Nama Lengkap, NIK, dan HP Orang Tua wajib diisi" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      // Hitung urutan pendaftar untuk buat ID Registrasi
      const countResult: any = await env.DB.prepare("SELECT COUNT(*) as total FROM ppdb_pendaftar").first();
      const nextId = (countResult?.total || 0) + 1;
      const year = new Date().getFullYear();
      const countStr = String(nextId).padStart(4, '0');
      const no_pendaftaran = `PPD-${year}-${countStr}`;

      const insertQuery = `
        INSERT INTO ppdb_pendaftar (
          no_pendaftaran, nama_lengkap, nik, tempat_lahir, tanggal_lahir, jenis_kelamin, agama,
          alamat, kelurahan, kecamatan, kota, provinsi,
          nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, no_hp_ortu, email_ortu,
          asal_sekolah, nilai_rata_rata, tahun_lulus, pilihan_kelas, jalur, status,
          catatan_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'Pendaftaran terkirim online via Cloudflare D1.')
      `;

      await env.DB.prepare(insertQuery).bind(
        no_pendaftaran, nama_lengkap, nik, tempat_lahir || "", tanggal_lahir || "", jenis_kelamin || "L", agama || "Islam",
        alamat || "", kelurahan || "", kecamatan || "", kota || "", provinsi || "",
        nama_ayah || "", nama_ibu || "", pekerjaan_ayah || "", pekerjaan_ibu || "", no_hp_ortu, email_ortu || "",
        asal_sekolah || "", Number(nilai_rata_rata) || 0, Number(tahun_lulus) || year, pilihan_kelas || "", jalur || "Reguler"
      ).run();

      return new Response(JSON.stringify({ success: true, data: { no_pendaftaran, nama_lengkap } }), {
        status: 201,
        headers: corsHeaders
      });
    }

    // 7. GET /api/ppdb/cek/:query
    if (path.startsWith("/api/ppdb/cek/") && method === "GET") {
      const queryParam = decodeURIComponent(path.substring("/api/ppdb/cek/".length)).trim().toLowerCase();
      const result = await env.DB.prepare("SELECT * FROM ppdb_pendaftar WHERE LOWER(no_pendaftaran) = ? OR LOWER(nik) = ?").bind(queryParam, queryParam).first();
      
      if (result) {
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({ error: "Nomor Pendaftaran atau NIK tidak ditemukan" }), {
          status: 404,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({ error: "Endpoint API tidak didukung pada serverless worker" }), {
      status: 404,
      headers: corsHeaders
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Server Error di Cloudflare Pages Functions", detail: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
};
