import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { ADMIN_SESSION_COOKIE, STUDENT_SESSION_COOKIE } from "./constants";
import type { AdminSession, StudentSession } from "./types";

const maxStudentAgeMs = 1000 * 60 * 45;
const maxAdminAgeMs = 1000 * 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 24) {
    throw new Error("SESSION_SECRET must be at least 24 characters.");
  }
  return value;
}

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSignedSession<T extends object>(data: T) {
  const payload = base64url(JSON.stringify(data));
  return `${payload}.${sign(payload)}`;
}

export function readSignedSession<T>(token?: string) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    return JSON.parse(fromBase64url(payload)) as T;
  } catch {
    return null;
  }
}

export async function setStudentSession(session: Omit<StudentSession, "issuedAt">) {
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, createSignedSession({ ...session, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxStudentAgeMs / 1000,
  });
}

export async function getStudentSession() {
  const cookieStore = await cookies();
  const session = readSignedSession<StudentSession>(cookieStore.get(STUDENT_SESSION_COOKIE)?.value);
  if (!session || Date.now() - session.issuedAt > maxStudentAgeMs) return null;
  return session;
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
}

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createSignedSession<AdminSession>({ email, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAdminAgeMs / 1000,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = readSignedSession<AdminSession>(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session || Date.now() - session.issuedAt > maxAdminAgeMs) return null;
  return session;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function verifyAdminPassword(password: string) {
  const configured = process.env.ADMIN_PASSWORD;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return bcrypt.compare(password, hash);
  if (!configured) return false;
  const suppliedBuffer = Buffer.from(password);
  const configuredBuffer = Buffer.from(configured);
  if (suppliedBuffer.length !== configuredBuffer.length) return false;
  return crypto.timingSafeEqual(suppliedBuffer, configuredBuffer);
}
