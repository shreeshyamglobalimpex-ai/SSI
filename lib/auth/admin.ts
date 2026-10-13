import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/prisma';
function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ADMIN_JWT_SECRET must be set to at least 32 characters in production.',
      );
    }
    return new TextEncoder().encode('dev-only-insecure-secret-min-32-characters');
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password:string){ return bcrypt.hash(password,12) }
export async function verifyPassword(password:string, hash:string){ return bcrypt.compare(password,hash) }
export async function createAdminToken(id:string,email:string){ const days=Number(process.env.ADMIN_SESSION_DAYS); const expires=Number.isFinite(days)&&days>0?`${days}d`:'7d'; return new SignJWT({sub:id,email,role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime(expires).sign(getSecret()) }
export async function getAdmin(){ const token=(await cookies()).get('ssi_admin')?.value; if(!token)return null; try{ const {payload}=await jwtVerify(token,getSecret()); if(!payload.sub)return null; return db.admin.findFirst({where:{id:String(payload.sub),active:true},select:{id:true,email:true,name:true,role:true}})}catch{return null} }
export async function requireAdmin(){ const admin=await getAdmin(); if(!admin) throw new Error('UNAUTHORIZED'); return admin }
