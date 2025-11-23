import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buscar aniversariantes do mês
router.get('/birthdays/month/:month', async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    if (month < 1 || month > 12) {
      return res.status(400).json({ success: false, error: 'Mês inválido (1-12)' });
    }

    const users = await User.find({
      birthday: { $exists: true, $ne: null }
    });

    const birthdaysInMonth = users.filter(user => {
      const birthday = new Date(user.birthday);
      return birthday.getMonth() + 1 === month;
    });

    res.json({ success: true, count: birthdaysInMonth.length, data: birthdaysInMonth });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
