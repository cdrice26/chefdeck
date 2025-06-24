import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
}
