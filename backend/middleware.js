// Custom middleware for json-server to handle /login and /register endpoints
module.exports = (req, res, next) => {

  /* ==================== LOGIN ==================== */
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password } = req.body;
    const db = req.app.db;
    const users = db.get('users').value();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const token = Buffer.from(
        JSON.stringify({ id: user.id, email: user.email, role: user.role, exp: Date.now() + 86400000 })
      ).toString('base64');

      return res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  }

  /* ==================== REGISTER ==================== */
  if (req.method === 'POST' && req.path === '/register') {
    const { name, email, password, role = 'employee' } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const db = req.app.db;
    const users = db.get('users').value();

    // Check duplicate email
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create user
    const newUser = {
      id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name,
      email,
      password,
      role,
    };
    db.get('users').push(newUser).write();

    // Auto-login: return token
    const token = Buffer.from(
      JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role, exp: Date.now() + 86400000 })
    ).toString('base64');

    return res.status(201).json({
      success: true,
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  }

  next();
};
