import { NextResponse } from 'next/server';
import { runAbandonedCartReminderJob } from '@/lib/jobs/abandoned-cart-reminder.job';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await runAbandonedCartReminderJob();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}
