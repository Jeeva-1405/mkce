require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

// ─── Config ──────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'facultysync';
const SESSION_TTL_HOURS = parseInt(process.env.SESSION_TTL_HOURS) || 24;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5000';

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
    origin: ALLOWED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, './'), {
    etag: false,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────

let _db;
const mongoClient = new MongoClient(MONGO_URI);

async function connectDB() {
    await mongoClient.connect();
    _db = mongoClient.db(DB_NAME);
    console.log(`[MongoDB] Connected to "${DB_NAME}"`);
}

const col = (name) => _db.collection(name);

// ─── Utilities ────────────────────────────────────────────────────────────────

const sanitizeProfile = (profile) => {
    if (!profile) return null;
    const { password, _id, ...safe } = profile;
    return safe;
};

async function hashPassword(password) {
    if (!password) return '';
    return await bcrypt.hash(password, 12);
}

// ─── Default Data ─────────────────────────────────────────────────────────────

const DEFAULT_CURRICULUM = {
    '1-ECE': [
        { name: "Engineering Mathematics II", type: "normal" },
        { name: "Engineering Mathematics II Lab", type: "batch" },
        { name: "Engineering Physics", type: "normal" },
        { name: "Engineering Physics Lab", type: "batch" },
        { name: "Data Structure", type: "normal" },
        { name: "Data Structure Project", type: "normal" },
        { name: "Career Skill Development I", type: "normal" },
        { name: "Counselling", type: "normal" }
    ],
    '1-VLSI': [
        { name: "Engineering Mathematics II", type: "normal" },
        { name: "Engineering Mathematics II Lab", type: "batch" },
        { name: "Engineering Physics", type: "normal" },
        { name: "Engineering Physics Lab", type: "batch" },
        { name: "Data Structure", type: "normal" },
        { name: "Data Structure Project", type: "normal" },
        { name: "Career Skill Development I", type: "normal" },
        { name: "Counselling", type: "normal" }
    ],
    '2-ECE': [
        { name: "Analog and Digital Communication", type: "normal" },
        { name: "Transmission Lines & Waveguide", type: "normal" },
        { name: "Microcontrollers & Interfacing", type: "normal" },
        { name: "Digital Signal Processing", type: "normal" },
        { name: "Integrated Optoelectronic Devices", type: "normal" },
        { name: "Machine Learning", type: "normal" },
        { name: "Artificial Intelligence", type: "normal" },
        { name: "IoT in Robotics", type: "normal" },
        { name: "Privacy & Security in IoT", type: "normal" },
        { name: "Analog and Digital Communication Lab", type: "batch" },
        { name: "Business Communication", type: "normal" },
        { name: "Career Skill Development III", type: "normal" },
        { name: "Library", type: "normal" },
        { name: "Counselling", type: "normal" }
    ],
    '2-VLSI': [
        { name: "Analog and Digital Communication", type: "normal" },
        { name: "Transmission Lines & Waveguide", type: "normal" },
        { name: "Microcontrollers & Interfacing", type: "normal" },
        { name: "Digital Signal Processing", type: "normal" },
        { name: "Integrated Optoelectronic Devices", type: "normal" },
        { name: "Machine Learning", type: "normal" },
        { name: "Artificial Intelligence", type: "normal" },
        { name: "IoT in Robotics", type: "normal" },
        { name: "Privacy & Security in IoT", type: "normal" },
        { name: "Analog and Digital Communication Lab", type: "batch" },
        { name: "Business Communication", type: "normal" },
        { name: "Career Skill Development III", type: "normal" },
        { name: "Library", type: "normal" },
        { name: "Counselling", type: "normal" }
    ],
    '3-ECE': [
        { name: "Wireless Communication", type: "normal" },
        { name: "Antenna & Millimetrewave Communication", type: "normal" },
        { name: "Microwave & Optical Communication", type: "normal" },
        { name: "Renewable Energy Source", type: "normal" },
        { name: "Comprehension", type: "batch" },
        { name: "Design Project", type: "batch" },
        { name: "Microwave & Optical Communication Lab", type: "batch" },
        { name: "Electromagnetic Interference & Compatibility", type: "elective" },
        { name: "SoC & NoC Design", type: "elective" },
        { name: "MEMS", type: "elective" },
        { name: "ASIC Design", type: "elective" },
        { name: "Advanced PCB Design and Testing", type: "elective" },
        { name: "Sensor Technology", type: "elective" },
        { name: "Library", type: "normal" },
        { name: "Counselling", type: "normal" }
    ],
    '3-VLSI': [
        { name: "Wireless Communication", type: "normal" },
        { name: "Antenna & Millimetrewave Communication", type: "normal" },
        { name: "Microwave & Optical Communication", type: "normal" },
        { name: "Renewable Energy Source", type: "normal" },
        { name: "Comprehension", type: "batch" },
        { name: "Design Project", type: "batch" },
        { name: "Microwave & Optical Communication Lab", type: "batch" },
        { name: "Electromagnetic Interference & Compatibility", type: "elective" },
        { name: "SoC & NoC Design", type: "elective" },
        { name: "MEMS", type: "elective" },
        { name: "ASIC Design", type: "elective" },
        { name: "Advanced PCB Design and Testing", type: "elective" },
        { name: "Sensor Technology", type: "elective" },
        { name: "Library", type: "normal" },
        { name: "Counselling", type: "normal" }
    ],
    '4-ECE': [
        { name: "VLSI Design", type: "normal" },
        { name: "Wireless Communication", type: "normal" },
        { name: "Embedded Systems", type: "normal" },
        { name: "Machine Learning", type: "normal" }
    ],
    '4-VLSI': [
        { name: "VLSI Design", type: "normal" },
        { name: "Wireless Communication", type: "normal" },
        { name: "Embedded Systems", type: "normal" },
        { name: "Machine Learning", type: "normal" }
    ]
};

const DEFAULT_SECTIONS = {
    '1': ['ECE-A', 'ECE-B', 'ECE-C', 'ECE-D', 'ECE-E', 'VLSI'],
    '2': ['ECE-A', 'ECE-B', 'ECE-C', 'ECE-D', 'VLSI'],
    '3': ['ECE-A', 'ECE-B', 'ECE-C', 'ECE-D', 'VLSI'],
    '4': ['ECE-A', 'ECE-B', 'ECE-C', 'ECE-D', 'VLSI']
};

const DEFAULT_FACULTIES = [
    { id: '001', password: '12345678', name: "Dr. Ram", dept: "ECE", desig: "Professor", phone: "9876543201", timetable: { 'cell-0-1': { subject: 'Digital Circuits', section: 'ECE-C', year: '2' }, 'cell-2-4': { subject: 'Signal Processing', section: 'ECE-A', year: '3' } } },
    { id: '002', password: '12345678', name: "Prof. Shallini", dept: "ECE", desig: "Associate Professor", phone: "9876543202", timetable: { 'cell-1-2': { subject: 'Microcontrollers', section: 'ECE-B', year: '3' }, 'cell-3-1': { subject: 'Embedded Systems', section: 'ECE-A', year: '4' } } },
    { id: '003', password: 'password', name: "Prof. Rajesh Kumar", dept: "ECE", desig: "Professor", phone: "9876543210", timetable: { 'cell-0-2': { subject: 'Network Theory', section: 'ECE-A', year: '2' }, 'cell-1-3': { subject: 'VLSI Design', section: 'ECE-B', year: '4' } } },
    { id: '004', password: 'password', name: "Dr. S. Kaviya", dept: "ECE", desig: "Associate Professor", phone: "9123456780", timetable: { 'cell-0-3': { subject: 'Control Systems', section: 'ECE-C', year: '3' }, 'cell-2-1': { subject: 'Communication Systems', section: 'ECE-A', year: '3' } } },
    { id: 'jeevamkce14@gmail.com', password: '12345678', name: "Admin User", dept: "Administration", desig: "System Administrator", phone: "0000000000", role: 'admin', timetable: {} },
    { id: 'hod_ece@example.com', password: '12345678', name: "Dr. S. K. Vijayakumar", dept: "ECE", desig: "Head of Department", phone: "9876543211", role: 'hod', timetable: {} }
];

// ─── Database Init / Seeding ──────────────────────────────────────────────────

async function initDB() {
    // Seed profiles
    const profileCount = await col('profiles').countDocuments();
    if (profileCount === 0) {
        const seeded = [];
        for (const f of DEFAULT_FACULTIES) {
            seeded.push({ ...f, password: await hashPassword(f.password) });
        }
        await col('profiles').insertMany(seeded);
        await col('profiles').createIndex({ id: 1 }, { unique: true });
        console.log('[initDB] Seeded default faculty profiles.');
    }

    // Seed curriculum config
    const curriculumDoc = await col('config').findOne({ key: 'curriculum' });
    if (!curriculumDoc) {
        await col('config').insertOne({ key: 'curriculum', data: DEFAULT_CURRICULUM });
        console.log('[initDB] Seeded default curriculum.');
    }

    // Seed sections config
    const sectionsDoc = await col('config').findOne({ key: 'sections' });
    if (!sectionsDoc) {
        await col('config').insertOne({ key: 'sections', data: DEFAULT_SECTIONS });
        console.log('[initDB] Seeded default sections.');
    }

    // Indexes
    await col('notifications').createIndex({ to: 1 });
    await col('sessions').createIndex({ token: 1 }, { unique: true });
    // TTL index: MongoDB auto-deletes sessions after SESSION_TTL_HOURS
    await col('sessions').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: SESSION_TTL_HOURS * 3600 }
    );

    console.log('[initDB] Indexes ensured.');
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const token = authHeader.split(' ')[1];
        const session = await col('sessions').findOne({ token });

        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Manual TTL safety net (in case TTL index hasn't fired yet)
        const ageHours = (Date.now() - new Date(session.createdAt)) / 3600000;
        if (ageHours >= SESSION_TTL_HOURS) {
            await col('sessions').deleteOne({ token });
            return res.status(401).json({ error: 'Session expired' });
        }

        req.user = session.user;
        next();
    } catch (err) {
        console.error('[requireAuth]', err);
        res.status(500).json({ error: 'Auth middleware error' });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
    try {
        let { id, password } = req.body;
        id = id ? id.trim() : '';

        const profile = await col('profiles').findOne({ id });
        if (!profile) return res.status(401).json({ error: 'User not found' });

        // Legacy SHA-256 detection
        const isLegacy = profile.password && profile.password.length === 64 && !profile.password.startsWith('$2');
        let isValid = false;

        if (isLegacy) {
            const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
            isValid = legacyHash === profile.password;
        } else {
            isValid = await bcrypt.compare(password, profile.password);
        }

        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Migrate to bcrypt if legacy
        if (isLegacy) {
            const newHash = await hashPassword(password);
            await col('profiles').updateOne({ id }, { $set: { password: newHash } });
            console.log(`[Migration] Upgraded ${id} to bcrypt`);
            profile.password = newHash;
        }

        const token = crypto.randomBytes(32).toString('hex');
        await col('sessions').insertOne({
            token,
            user: sanitizeProfile(profile),
            createdAt: new Date()
        });

        res.json({ success: true, profile: sanitizeProfile(profile), token });
    } catch (err) {
        console.error('[POST /api/login]', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ─── Protected Routes ─────────────────────────────────────────────────────────

app.use((req, res, next) => {
    if (req.path.startsWith('/api/') && req.path !== '/api/login') {
        return requireAuth(req, res, next);
    }
    next();
});

// ─── Profiles ────────────────────────────────────────────────────────────────

// GET all profiles
app.get('/api/profiles', async (req, res) => {
    try {
        const profiles = await col('profiles').find({}).toArray();
        res.json(profiles.map(sanitizeProfile));
    } catch (err) {
        console.error('[GET /api/profiles]', err);
        res.status(500).json({ error: 'Failed to fetch profiles' });
    }
});

// GET single profile
app.get('/api/profiles/:id', async (req, res) => {
    try {
        const profile = await col('profiles').findOne({ id: req.params.id });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(sanitizeProfile(profile));
    } catch (err) {
        console.error('[GET /api/profiles/:id]', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// POST save/update profile
app.post('/api/profiles', async (req, res) => {
    try {
        const data = { ...req.body };

        // Non-admins can only update their own profile
        let id = req.user.id;
        if (req.user.role === 'admin') {
            id = data.id || id;
        }
        delete data.id; // Don't allow overwriting the id field via $set

        // Hash password if provided and not already bcrypt
        if (data.password) {
            if (data.password.length < 30 || !data.password.startsWith('$2')) {
                data.password = await hashPassword(data.password);
            }
        } else {
            delete data.password; // Don't overwrite with empty
        }

        // Preserve role unless requester is admin
        const existing = await col('profiles').findOne({ id });
        const existingRole = existing ? existing.role : 'faculty';
        data.role = req.user.role === 'admin' ? (data.role || existingRole) : existingRole;

        await col('profiles').updateOne(
            { id },
            { $set: { ...data, id } },
            { upsert: true }
        );

        const updated = await col('profiles').findOne({ id });
        res.json({ success: true, profile: sanitizeProfile(updated) });
    } catch (err) {
        console.error('[POST /api/profiles]', err);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// DELETE profile
app.delete('/api/profiles/:id', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        if (req.params.id === req.user.id) {
            return res.status(403).json({ error: 'Cannot delete your own account' });
        }

        const result = await col('profiles').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log(`[AUDIT] Profile ${req.params.id} deleted by admin ${req.user.id} at ${new Date().toISOString()}`);
        res.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/profiles/:id]', err);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
});

// ─── Password Change ──────────────────────────────────────────────────────────

app.post('/api/change-password', async (req, res) => {
    try {
        const { id, oldPassword, newPassword } = req.body;

        if (!newPassword) return res.status(400).json({ error: 'New password is required' });

        let targetId = req.user.id;
        const isAdminOverride = req.user.role === 'admin' && id && id !== req.user.id;

        if (isAdminOverride) {
            targetId = id;
            console.log(`[AUDIT] Admin ${req.user.id} reset password for ${targetId}`);
        }

        const profile = await col('profiles').findOne({ id: targetId });
        if (!profile) return res.status(404).json({ error: 'User not found' });

        // Non-admins must provide oldPassword
        if (!isAdminOverride && !oldPassword) {
            return res.status(400).json({ error: 'Current password is required' });
        }

        if (oldPassword) {
            const isMatch = await bcrypt.compare(oldPassword, profile.password);
            if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const newHash = await hashPassword(newPassword);
        await col('profiles').updateOne({ id: targetId }, { $set: { password: newHash } });
        res.json({ success: true });
    } catch (err) {
        console.error('[POST /api/change-password]', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// ─── Notifications ────────────────────────────────────────────────────────────

// GET all notifications (admin/HOD see all; others see own)
app.get('/api/notifications', async (req, res) => {
    try {
        const isPrivileged = ['admin', 'hod'].includes(req.user.role);
        const query = isPrivileged
            ? {}
            : { $or: [{ to: req.user.id }, { from: req.user.id }] };

        const notifs = await col('notifications').find(query).sort({ timestamp: -1 }).toArray();
        res.json(notifs.map(({ _id, ...n }) => n));
    } catch (err) {
        console.error('[GET /api/notifications]', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// GET notifications for a specific user
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const targetId = req.params.userId;
        const isPrivileged = ['admin', 'hod'].includes(req.user.role);

        if (req.user.id !== targetId && !isPrivileged) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const notifs = await col('notifications').find({ to: targetId }).sort({ timestamp: -1 }).toArray();
        res.json(notifs.map(({ _id, ...n }) => n));
    } catch (err) {
        console.error('[GET /api/notifications/:userId]', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST send notification
app.post('/api/notifications', async (req, res) => {
    try {
        const newNotif = {
            ...req.body,
            // Override from/fromName from session to prevent spoofing
            from: req.user.id,
            fromName: req.user.name || 'Unknown',
            notifId: crypto.randomBytes(16).toString('hex'),
            timestamp: new Date().toISOString(),
            read: false
        };

        await col('notifications').insertOne(newNotif);
        const { _id, ...safeNotif } = newNotif;
        res.json(safeNotif);
    } catch (err) {
        console.error('[POST /api/notifications]', err);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// PUT mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const rawId = req.params.id;
        const query = { $or: [{ notifId: rawId }, { id: Number(rawId) }] };

        const notif = await col('notifications').findOne(query);
        if (!notif) return res.status(404).json({ error: 'Notification not found' });

        const isPrivileged = ['admin', 'hod'].includes(req.user.role);
        if (notif.to !== req.user.id && !isPrivileged) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        await col('notifications').updateOne(query, { $set: { read: true } });
        res.json({ success: true });
    } catch (err) {
        console.error('[PUT /api/notifications/:id/read]', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// ─── Curriculum ───────────────────────────────────────────────────────────────

app.get('/api/curriculum', async (req, res) => {
    try {
        const doc = await col('config').findOne({ key: 'curriculum' });
        res.json(doc ? doc.data : DEFAULT_CURRICULUM);
    } catch (err) {
        console.error('[GET /api/curriculum]', err);
        res.status(500).json({ error: 'Failed to fetch curriculum' });
    }
});

app.post('/api/curriculum', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        await col('config').updateOne(
            { key: 'curriculum' },
            { $set: { data: req.body } },
            { upsert: true }
        );
        res.json({ success: true, curriculum: req.body });
    } catch (err) {
        console.error('[POST /api/curriculum]', err);
        res.status(500).json({ error: 'Failed to save curriculum' });
    }
});

// ─── Sections ─────────────────────────────────────────────────────────────────

app.get('/api/sections', async (req, res) => {
    try {
        const doc = await col('config').findOne({ key: 'sections' });
        res.json(doc ? doc.data : DEFAULT_SECTIONS);
    } catch (err) {
        console.error('[GET /api/sections]', err);
        res.status(500).json({ error: 'Failed to fetch sections' });
    }
});

app.post('/api/sections', async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        await col('config').updateOne(
            { key: 'sections' },
            { $set: { data: req.body } },
            { upsert: true }
        );
        res.json({ success: true, sections: req.body });
    } catch (err) {
        console.error('[POST /api/sections]', err);
        res.status(500).json({ error: 'Failed to save sections' });
    }
});

// ─── Startup ──────────────────────────────────────────────────────────────────

connectDB()
    .then(initDB)
    .then(() => app.listen(PORT, () => {
        console.log(`[Server] Running at http://localhost:${PORT}`);
    }))
    .catch((err) => {
        console.error('[Startup Error]', err);
        process.exit(1);
    });
