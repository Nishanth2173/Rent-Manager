import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Visit /api/health in your browser to check database connectivity
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      userCount,
      tenantCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[health check] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        database: 'disconnected',
        message: error.message,
        code: error.code || 'UNKNOWN',
      },
      { status: 500 }
    );
  }
}
