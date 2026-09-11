import prisma from "../lib/prisma.js";

export async function createUser(req, res, next) {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "name y email son obligatorios" });
    }

    const user = await prisma.user.create({
      data: { name, email },
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El email ya existe" });
    }
    return next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "id inválido" });
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const { name, email } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "id inválido" });
    }

    if (!name && !email) {
      return res.status(400).json({ message: "Debes enviar al menos name o email" });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
      },
    });

    return res.json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El email ya existe" });
    }
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "id inválido" });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
