import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { sendWelcomeEmail } from "../lib/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function welcomeEmail(req, res, next) {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El email es obligatorio" });
    }

    const info = await sendWelcomeEmail({ name, email });

    return res.status(200).json({
      message: "Correo de bienvenida enviado",
      messageId: info.messageId,
      previewUrl: info.previewUrl,
    });
  } catch (error) {
    return next(error);
  }
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email y password son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "La password debe tener al menos 6 caracteres" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    try {
      const info = await sendWelcomeEmail({
        name: user.name,
        email: user.email,
      });

      console.log("📧 Correo de bienvenida enviado:", info.previewUrl);
    } catch (mailError) {
      console.warn("⚠️ No se pudo enviar el correo de bienvenida:", mailError.message);
    }

    return res.status(201).json({
      message: "Usuario registrado",
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "El email ya está registrado" });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email y password son obligatorios" });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET no está configurado" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}
