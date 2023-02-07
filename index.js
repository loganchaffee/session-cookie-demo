const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { v4: uuid } = require('uuid');
const cookieParser = require('cookie-parser');
const fs = require('fs/promises');

const app = express();

/* -------------------------------- Middleware ------------------------------- */

app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use(bodyParser.json({ limit: '30mb', extended: true }));

app.use(cookieParser());

app.use(cors());

/* --------------------------- Database Connection -------------------------- */

const db = mysql.createPool({
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: `session_cookie_app`,
});

/* ------------------------------- Page Routes ------------------------------ */

app.get('/', async (req, res) => {
    try {
        res.sendFile('index.html', { root: __dirname });
    } catch (error) {
        console.log(error);
        res.send('There was an error');
    }
});

app.get('/profile', async (req, res) => {
    try {
        // Check for session cookie
        if (!req.cookies.session) {
            return res.redirect(307, '/');
        }

        const sessionId = req.cookies.session;

        // Validate session cookie
        let [rows] = await db.execute('SELECT * FROM session WHERE id = ?', [sessionId]);

        if (rows.length < 1) {
            return res.redirect(307, '/');
        }

        const session = rows[0];

        // Get user from session
        [rows] = await db.execute('SELECT * FROM user WHERE id = ?', [session.user_id]);

        if (rows.length < 1) {
            return res.redirect(307, '/');
        }

        const user = rows[0];

        // Create html markup with username variable
        const buffer = await fs.readFile('./profile.html');

        let htmlString = buffer.toString();

        htmlString = htmlString.replace('{{username}}', user.username);

        res.send(htmlString);
    } catch (error) {
        console.log(error);
        res.send('There was an error');
    }
});

/* ------------------------------- API Routes ------------------------------- */

app.post('/api/sign-up', async (req, res) => {
    try {
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 12);

        await db.execute('INSERT INTO user (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(200).json({ data: 'Successfully created user' });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: 'there was an error on the server' });
    }
});

app.post('/api/sign-in', async (req, res) => {
    try {
        const { username, password } = req.body;

        let [rows] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);

        if (rows.length < 1) {
            return res.status(404).json({ data: 'user with that username does not exist' });
        }

        const user = rows[0];

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(405).json({
                error: 'Incorrect password',
            });
        }

        const sessionId = uuid();

        [rows] = await db.execute('INSERT INTO session (id, user_id) VALUES (?, ?)', [sessionId, user.id]);

        res.cookie('session', sessionId, { httpOnly: true });

        res.status(200).json({ data: 'connected successfully' });
    } catch (error) {
        console.log(error);

        res.status(500).json({ error: 'there was an error on the server' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log('App listening on port ' + PORT));
