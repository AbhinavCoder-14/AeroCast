import { NextResponse } from "next/server";
import prisma from "@/app/lib/db";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Await the params object before accessing its properties
    console.log("Entered in the [jobId] Api route for hourly chart data")
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    const job = await prisma.jobs.findUnique({
      where: {
        jobId: jobId,
      }
    });
    
    console.log("Complete job data:", job)

    if (!job) {
      return NextResponse.json(
        { error: "Job not found"},
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error: any) {
      console.error(`[API Get Job] Error:`, error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}