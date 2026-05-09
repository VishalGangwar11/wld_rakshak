import { NextRequest, NextResponse } from "next/server";

// Mock in-memory store for detections (replace with Prisma in production)
const detections: Array<{
  id: string;
  animal: string;
  threatLevel: string;
  confidence: number;
  latitude: number;
  longitude: number;
  region: string;
  createdAt: string;
}> = [];

export async function GET() {
  return NextResponse.json({ detections });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const detection = {
      id: `DET-${Date.now()}`,
      animal: body.animal,
      threatLevel: body.threatLevel,
      confidence: body.confidence,
      latitude: body.latitude ?? 30.1575,
      longitude: body.longitude ?? 78.7733,
      region: body.region ?? "Pauri Garhwal",
      createdAt: new Date().toISOString(),
    };
    detections.push(detection);
    return NextResponse.json({ success: true, detection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
