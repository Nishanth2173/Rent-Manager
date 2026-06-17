import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { generateMonthlyRentForTenant, updateOverdueStatuses } from '../../../../utils/rentGeneration';

// This endpoint is called by external cron services (cron-job.org, EasyCron, etc.)
// or Vercel Cron. It runs monthly to auto-generate rent records for ALL tenants.
//
// Schedule: 0 0 1 * * (1st of every month at midnight)
// URL: https://your-app.vercel.app/api/cron/generate-rent
// Header: x-cron-secret: <your CRON_SECRET>

export async function GET(request) {
  return handleGeneration(request);
}

export async function POST(request) {
  return handleGeneration(request);
}

async function handleGeneration(request) {
  // Security: verify cron secret header
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const headerSecret = request.headers.get('x-cron-secret')
      || request.headers.get('authorization')?.replace('Bearer ', '');

    if (headerSecret !== cronSecret) {
      console.warn('[CRON] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();
    console.log('[CRON] Starting monthly rent generation...');

    // Get ALL active tenants across all landlords
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
    });

    let totalCreated = 0;
    const details = [];

    for (const tenant of tenants) {
      const created = await generateMonthlyRentForTenant(tenant);
      if (created.length > 0) {
        totalCreated += created.length;
        details.push({
          tenantId: tenant.id,
          name: tenant.name,
          recordsCreated: created.length,
          months: created.map(r => r.rentMonth),
        });
      }
    }

    // Update any pending → overdue
    const overdueUpdated = await updateOverdueStatuses();

    const elapsed = Date.now() - startTime;
    console.log(`[CRON] Done in ${elapsed}ms. Created: ${totalCreated}, Overdue updated: ${overdueUpdated}`);

    return NextResponse.json({
      success: true,
      totalTenants: tenants.length,
      recordsCreated: totalCreated,
      overdueUpdated,
      details,
      executionMs: elapsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
