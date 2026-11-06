'use strict';
// Builds server/seed/users.json and server/seed/db.json: the 10 demo accounts and their content
// (karya, likes, comments, follows, messages, notifications).
//   npm run seed            regenerate the seed files
//   npm run server:reset    copy them into server/data/ (the files the running API uses)
// Every demo account uses the password below. users.json only gets its scrypt hash.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const { hashPassword } = require('../lib/password');

const DEMO_PASSWORD = 'Creativo123';
const NOW = Date.parse('2026-10-21T02:00:00Z'); // 09:00 WIB

/** A stable UUID from a name, so ids stay the same each time the seed is rebuilt */
function stableId(name) {
  const h = crypto.createHash('sha1').update(`creativo:${name}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const hoursAgo = (h) => new Date(NOW - h * 3_600_000).toISOString();
const avatar = (name) =>
  `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(name)}&size=256&backgroundColor=f1f0ec`;
const photo = (slug) => `https://picsum.photos/seed/creativo-${slug}/1080/1080`;

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

const people = [
  {
    key: 'rina',
    full_name: 'Rina Kartika',
    profession: 'uiux',
    experience_level: 'senior',
    specializations: ['Mobile UI', 'Design System', 'Riset UX'],
    headline: 'Product designer yang merancang aplikasi mobile yang ramah pengguna',
    open_to_work: true,
  },
  {
    key: 'bagas',
    full_name: 'Bagas Pratama',
    profession: 'informatics',
    experience_level: 'mid',
    specializations: ['Aplikasi Mobile', 'Backend & APIs'],
    headline: 'Mobile developer React Native & Node.js',
    open_to_work: true,
  },
  {
    key: 'dewi',
    full_name: 'Dewi Lestari',
    profession: 'photographer',
    experience_level: 'senior',
    specializations: ['Potret', 'Pernikahan'],
    headline: 'Fotografer potret dan pernikahan di Yogyakarta',
    open_to_work: false,
  },
  {
    key: 'andi',
    full_name: 'Andi Saputra',
    profession: 'architect',
    experience_level: 'lead',
    specializations: ['Hunian', 'Desain Berkelanjutan', 'Visualisasi 3D'],
    headline: 'Arsitek rumah tropis yang hemat energi',
    open_to_work: false,
  },
  {
    key: 'maya',
    full_name: 'Maya Anggraini',
    profession: 'graphic',
    experience_level: 'mid',
    specializations: ['Branding', 'Ilustrasi', 'Tipografi'],
    headline: 'Desainer brand untuk UMKM lokal',
    open_to_work: true,
  },
  {
    key: 'fajar',
    full_name: 'Fajar Nugroho',
    profession: 'data',
    experience_level: 'mid',
    specializations: ['Machine Learning', 'Visualisasi Data'],
    headline: 'Data scientist yang mengubah data jadi keputusan',
    open_to_work: true,
  },
  {
    key: 'nadia',
    full_name: 'Nadia Putri',
    profession: 'creator',
    experience_level: 'junior',
    specializations: ['Video Pendek', 'Video Editing'],
    headline: 'Kreator video pendek tentang kuliner Nusantara',
    open_to_work: false,
  },
  {
    key: 'reza',
    full_name: 'Reza Mahendra',
    profession: 'marketer',
    experience_level: 'senior',
    specializations: ['Media Sosial', 'Iklan Performa', 'Copywriting'],
    headline: 'Growth marketer untuk brand lokal',
    open_to_work: false,
  },
  {
    key: 'intan',
    full_name: 'Intan Permata',
    profession: 'informatics',
    experience_level: 'student',
    specializations: ['Pengembangan Web', 'UI Engineering'],
    headline: 'Mahasiswa Informatika, belajar web dan mobile',
    open_to_work: true,
  },
  {
    key: 'yoga',
    full_name: 'Yoga Firmansyah',
    profession: 'creator',
    experience_level: 'mid',
    specializations: ['Motion Graphics', 'Cinematography'],
    headline: 'Motion designer dan videografer',
    open_to_work: true,
  },
];

const id = Object.fromEntries(people.map((p) => [p.key, stableId(`user:${p.key}`)]));

const users = people.map((p, i) => ({
  id: id[p.key],
  username: p.full_name.toLowerCase().replace(/[^a-z]/g, ''),
  email: `${p.key}@creativo.id`,
  full_name: p.full_name,
  password_hash: hashPassword(DEMO_PASSWORD),
  avatar_url: avatar(p.full_name),
  profession: p.profession,
  specializations: p.specializations,
  experience_level: p.experience_level,
  headline: p.headline,
  open_to_work: p.open_to_work,
  onboarded_at: hoursAgo(24 * 40 - i * 30),
  created_at: hoursAgo(24 * 40 - i * 30 + 1),
  tokens_valid_after: 0,
  biometric_tokens: [],
}));

// ---------------------------------------------------------------------------
// Posts (karya = portfolio work, post = everyday update)
// ---------------------------------------------------------------------------

const postSpecs = [
  ['rina', 'karya', 2, 'Redesign aplikasi ojek kampus: alur pemesanan jadi 3 langkah. Riset dengan 12 mahasiswa, prototipe di Figma.'],
  ['rina', 'karya', 1, 'Design system "Batik UI": 48 komponen, token warna, dan mode gelap. Siap dipakai tim developer.'],
  ['rina', 'post', 1, 'Hari ini mengisi workshop UX di kampus. Terima kasih untuk semua yang datang!'],
  ['bagas', 'karya', 2, 'Aplikasi presensi berbasis lokasi dengan React Native + Node.js. Sudah dipakai 300 mahasiswa.'],
  ['bagas', 'karya', 1, 'REST API toko online UMKM: login dengan JWT, unggah foto produk, dan laporan penjualan.'],
  ['bagas', 'post', 1, 'Lagi belajar Expo Router. Navigasi berbasis file ternyata rapi banget.'],
  ['dewi', 'karya', 3, 'Seri potret "Pasar Pagi" di Yogyakarta. Cahaya jam enam pagi selalu jujur.'],
  ['dewi', 'karya', 1, 'Prewedding di Pantai Parangtritis saat golden hour.'],
  ['andi', 'karya', 2, 'Rumah tropis dua lantai di Bandung: ventilasi silang, atap lebar, dan panel surya.'],
  ['andi', 'karya', 1, 'Render interior kafe minimalis dengan material kayu daur ulang.'],
  ['andi', 'post', 1, 'Survei lahan untuk proyek perumahan berkelanjutan minggu ini.'],
  ['maya', 'karya', 2, 'Branding Kopi Senja: logo, kemasan, dan menu. Warna terinspirasi langit sore.'],
  ['maya', 'karya', 1, 'Ilustrasi poster festival budaya Nusantara.'],
  ['fajar', 'karya', 1, 'Dasbor penjualan real-time untuk 40 cabang ritel. Laporan harian jadi 5 menit.'],
  ['fajar', 'karya', 2, 'Model prediksi curah hujan untuk petani, akurasi 87% pada data uji.'],
  ['nadia', 'karya', 1, 'Video 60 detik: resep rendang ala anak kos.'],
  ['nadia', 'post', 2, 'Di balik layar syuting konten kuliner minggu ini.'],
  ['reza', 'karya', 1, 'Kampanye media sosial untuk brand batik lokal: engagement naik 3x dalam sebulan.'],
  ['reza', 'post', 1, 'Tips copywriting: tulis untuk satu orang, bukan untuk semua orang.'],
  ['intan', 'karya', 1, 'Website portofolio pertama saya, dibangun dengan React dan Tailwind.'],
  ['intan', 'post', 1, 'Baru selesai UTS Pemrograman Mobile. Berikutnya: bikin aplikasi dengan Expo!'],
  ['yoga', 'karya', 1, 'Motion graphic pembuka untuk channel YouTube teknologi.'],
  ['yoga', 'karya', 2, 'Video sinematik "Kota Tua di Pagi Hari".'],
];

const posts = postSpecs.map(([key, kind, images, caption], i) => {
  const at = hoursAgo(24 * 28 - i * 28);
  return {
    id: stableId(`post:${i}`),
    author_id: id[key],
    image_paths: Array.from({ length: images }, (_, n) => photo(`${key}-${i}-${n}`)),
    caption,
    kind,
    created_at: at,
    updated_at: at,
  };
});

// ---------------------------------------------------------------------------
// Follows: a pair that follows each other is a koneksi
// ---------------------------------------------------------------------------

const mutual = [
  ['rina', 'bagas'],
  ['rina', 'maya'],
  ['rina', 'andi'],
  ['bagas', 'intan'],
  ['bagas', 'fajar'],
  ['dewi', 'yoga'],
  ['reza', 'maya'],
  ['nadia', 'yoga'],
  ['nadia', 'reza'],
];
const oneWay = [
  ['intan', 'rina'],
  ['fajar', 'rina'],
  ['yoga', 'rina'],
  ['nadia', 'dewi'],
  ['maya', 'dewi'],
  ['andi', 'dewi'],
  ['reza', 'bagas'],
  ['intan', 'fajar'],
  ['yoga', 'maya'],
  ['dewi', 'andi'],
];
const follows = [];
let followHour = 24 * 30;
for (const [a, b] of mutual) {
  follows.push({ follower_id: id[a], following_id: id[b], created_at: hoursAgo((followHour -= 9)) });
  follows.push({ follower_id: id[b], following_id: id[a], created_at: hoursAgo((followHour -= 9)) });
}
for (const [a, b] of oneWay) follows.push({ follower_id: id[a], following_id: id[b], created_at: hoursAgo((followHour -= 9)) });

// ---------------------------------------------------------------------------
// Likes: picked by a fixed pseudo-random sequence, so the seed is the same every time
// ---------------------------------------------------------------------------

let state = 7;
const random = () => {
  state = (state * 1103515245 + 12345) % 2147483648;
  return state / 2147483648;
};

const post_likes = [];
for (const post of posts) {
  for (const user of users) {
    if (user.id === post.author_id || random() > 0.45) continue;
    const after = Date.parse(post.created_at);
    post_likes.push({ post_id: post.id, user_id: user.id, created_at: new Date(Math.min(NOW, after + 3_600_000 * (1 + random() * 40))).toISOString() });
  }
}

// ---------------------------------------------------------------------------
// Comments (with replies) and their likes
// ---------------------------------------------------------------------------

const commentSpecs = [
  // [post index, author, text, reply to comment index?]
  [0, 'bagas', 'Alurnya jauh lebih cepat! Boleh minta file Figma-nya untuk referensi?'],
  [0, 'rina', 'Boleh, nanti aku kirim lewat pesan ya.', 0],
  [0, 'intan', 'Keren banget risetnya, Kak.'],
  [3, 'rina', 'UI presensinya bersih. Pakai geofencing atau GPS biasa?'],
  [3, 'bagas', 'GPS + radius 50 meter dari titik kelas.', 3],
  [6, 'yoga', 'Warna dan cahayanya juara.'],
  [8, 'rina', 'Atap lebarnya bikin rumah adem. Suka!'],
  [11, 'reza', 'Branding-nya kuat, cocok untuk kampanye musim hujan.'],
  [11, 'maya', 'Terima kasih! Yuk kolaborasi.', 7],
  [14, 'bagas', 'Datanya dari mana, Mas?'],
  [14, 'fajar', 'Data curah hujan terbuka, dibersihkan dulu dengan pandas.', 9],
  [17, 'maya', 'Hasilnya mantap. Boleh tahu strategi kontennya?'],
  [19, 'bagas', 'Mantap untuk portofolio pertama. Lanjutkan!'],
  [19, 'intan', 'Terima kasih, Kak Bagas!', 12],
  [22, 'dewi', 'Komposisinya rapi sekali.'],
];

const comments = commentSpecs.map(([postIndex, key, body, replyTo], i) => {
  const post = posts[postIndex];
  return {
    id: stableId(`comment:${i}`),
    post_id: post.id,
    author_id: id[key],
    parent_id: replyTo === undefined ? null : stableId(`comment:${replyTo}`),
    body,
    created_at: new Date(Date.parse(post.created_at) + 3_600_000 * (2 + i)).toISOString(),
  };
});

const comment_likes = [
  [0, 'rina'],
  [3, 'bagas'],
  [5, 'dewi'],
  [7, 'maya'],
  [12, 'intan'],
].map(([index, key]) => ({
  comment_id: comments[index].id,
  user_id: id[key],
  created_at: new Date(Date.parse(comments[index].created_at) + 1_800_000).toISOString(),
}));

// ---------------------------------------------------------------------------
// Direct messages
// ---------------------------------------------------------------------------

const messageSpecs = [
  ['bagas', 'rina', 'Halo Rina, aku lihat redesign ojek kampusmu. Keren!', 30],
  ['rina', 'bagas', 'Makasih Bagas! Kamu yang bikin aplikasi presensi itu kan?', 29],
  ['bagas', 'rina', 'Iya. Mau kolaborasi untuk versi berikutnya? Aku butuh desainer.', 28],
  ['rina', 'bagas', 'Boleh banget. Kita atur jadwal minggu depan ya.', 27],
  ['reza', 'maya', 'Maya, ada brand kopi yang butuh refresh logo. Tertarik?', 20],
  ['maya', 'reza', 'Tertarik! Kirim brief-nya ya.', 19],
  ['intan', 'bagas', 'Kak Bagas, boleh minta saran belajar React Native dari mana dulu?', 6],
  ['intan', 'bagas', 'Aku baru selesai belajar dasar JavaScript.', 5],
  ['dewi', 'yoga', 'Yoga, minggu depan ada sesi prewedding. Mau bantu video?', 3],
];

const messages = messageSpecs.map(([from, to, body, h], i) => ({
  id: stableId(`message:${i}`),
  seq: i + 1,
  sender_id: id[from],
  recipient_id: id[to],
  body,
  created_at: hoursAgo(h),
  // Older messages were read; the latest few are still waiting
  read_at: h > 4 && !(from === 'intan') ? hoursAgo(h - 1) : null,
}));

// ---------------------------------------------------------------------------
// Notifications: what the API creates for each like, comment, reply and follow
// ---------------------------------------------------------------------------

const notifications = [];
const notify = (type, recipient, actor, created_at, post_id = null, comment_id = null) => {
  if (recipient === actor) return;
  notifications.push({
    id: stableId(`notification:${notifications.length}`),
    recipient_id: recipient,
    actor_id: actor,
    type,
    post_id,
    comment_id,
    created_at,
    // Anything older than two days has been seen
    read_at: NOW - Date.parse(created_at) > 48 * 3_600_000 ? created_at : null,
  });
};

const postById = new Map(posts.map((p) => [p.id, p]));
const commentById = new Map(comments.map((c) => [c.id, c]));
for (const l of post_likes) notify('like_post', postById.get(l.post_id).author_id, l.user_id, l.created_at, l.post_id);
for (const c of comments) {
  const post = postById.get(c.post_id);
  const parent = c.parent_id ? commentById.get(c.parent_id) : null;
  if (parent) notify('reply', parent.author_id, c.author_id, c.created_at, post.id, c.id);
  if (!parent || parent.author_id !== post.author_id) notify('comment', post.author_id, c.author_id, c.created_at, post.id, c.id);
}
for (const l of comment_likes) {
  const c = commentById.get(l.comment_id);
  notify('like_comment', c.author_id, l.user_id, l.created_at, c.post_id, c.id);
}
for (const f of follows) notify('follow', f.following_id, f.follower_id, f.created_at);
notifications.sort((a, b) => b.created_at.localeCompare(a.created_at));

// ---------------------------------------------------------------------------

const db = {
  meta: { seq: messages.length },
  posts,
  post_likes,
  comments,
  comment_likes,
  follows,
  notifications,
  messages,
  revoked_tokens: [],
};

const seedDir = path.join(__dirname, '..', 'seed');
fs.mkdirSync(seedDir, { recursive: true });
fs.writeFileSync(path.join(seedDir, 'users.json'), `${JSON.stringify(users, null, 2)}\n`);
fs.writeFileSync(path.join(seedDir, 'db.json'), `${JSON.stringify(db, null, 2)}\n`);

console.log(`Seed dibuat: ${users.length} akun, ${posts.length} postingan, ${post_likes.length} suka, ${comments.length} komentar,`);
console.log(`${follows.length} ikuti, ${messages.length} pesan, ${notifications.length} notifikasi → server/seed/`);
console.log(`Kata sandi semua akun demo: ${DEMO_PASSWORD}`);
